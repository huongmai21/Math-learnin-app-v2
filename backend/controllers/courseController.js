const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const Course = require("../models/Course");
const User = require("../models/User");
const Review = require("../models/Review");
const Enrollment = require("../models/Enrollment");
const stripe = require("../config/stripe");
const Notification = require("../models/Notification");

exports.getCourses = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 6, category, instructorId } = req.query;
  const query = { status: "approved" };

  if (category && category !== "all") {
    query.category = category;
  }
  if (instructorId) {
    query.instructorId = instructorId;
  }

  const courses = await Course.find(query)
    .populate("instructorId", "username avatar")
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Course.countDocuments(query);
  res.status(200).json({
    success: true,
    data: courses,
    totalPages: Math.ceil(total / limit),
    currentPage: Number(page),
  });
});

// Lấy khóa học nổi bật cho Trang chủ
exports.getFeaturedCourses = asyncHandler(async (req, res, next) => {
  const limit = Number(req.query.limit) || 3;

  try {
    // Lấy số lượng đăng ký cho mỗi khóa học
    const enrollmentCounts = await Enrollment.aggregate([
      { $group: { _id: "$courseId", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit },
    ]);

    const courseIds = enrollmentCounts.map((item) => item._id);

    // Lấy thông tin khóa học và kết hợp số lượng đăng ký
    let featuredCourses = [];
    if (courseIds.length > 0) {
      featuredCourses = await Course.find({
        _id: { $in: courseIds },
        status: "approved",
      }).populate("instructorId", "username avatar");

      featuredCourses = featuredCourses.map((course) => {
        const enrollment = enrollmentCounts.find(
          (e) => e._id.toString() === course._id.toString()
        );
        return {
          ...course._doc,
          enrollmentCount: enrollment ? enrollment.count : 0,
        };
      });
    }

    // Bổ sung khóa học mới nếu không đủ
    if (featuredCourses.length < limit) {
      const additionalCourses = await Course.find({
        _id: { $nin: courseIds },
        status: "approved",
      })
        .sort({ createdAt: -1 })
        .limit(limit - featuredCourses.length)
        .populate("instructorId", "username avatar");

      const additionalEnrollmentCounts = await Enrollment.aggregate([
        { $match: { courseId: { $in: additionalCourses.map((c) => c._id) } } },
        { $group: { _id: "$courseId", count: { $sum: 1 } } },
      ]);

      const additionalWithCounts = additionalCourses.map((course) => {
        const enrollment = additionalEnrollmentCounts.find(
          (e) => e._id.toString() === course._id.toString()
        );
        return {
          ...course._doc,
          enrollmentCount: enrollment ? enrollment.count : 0,
        };
      });

      featuredCourses = [...featuredCourses, ...additionalWithCounts];
    }

    res.status(200).json({
      success: true,
      count: featuredCourses.length,
      data: featuredCourses,
    });
  } catch (error) {
    console.error("Error fetching featured courses:", error);
    // Trả về mảng rỗng thay vì lỗi 500
    res.status(200).json({
      success: true,
      count: 0,
      data: [],
      message: "Không có khóa học nổi bật nào",
    });
  }
});
exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id)
    .populate("instructorId", "username avatar")
    .populate({
      path: "contents",
      select: "title type url isPreview",
    });
  if (!course || course.status !== "approved") {
    return next(
      new ErrorResponse("Khóa học không tồn tại hoặc chưa được phê duyệt", 404)
    );
  }
  res.status(200).json({ success: true, data: course });
});

exports.createCourse = asyncHandler(async (req, res, next) => {
  const { title, description, price, thumbnail, category } = req.body;
  const course = await Course.create({
    title,
    description,
    price,
    thumbnail,
    category,
    instructorId: req.user._id,
    status: req.user.role === "admin" ? "approved" : "pending",
  });

  // Thông báo cho admin khi có khóa học mới cần duyệt
  if (course.status === "pending") {
    const admins = await User.find({ role: "admin" });
    await Notification.insertMany(
      admins.map((admin) => ({
        recipient: admin._id,
        sender: req.user._id,
        type: "system",
        title: "Khóa học mới cần duyệt",
        message: `Khóa học "${title}" đã được tạo và đang chờ duyệt.`,
        link: `/courses/${course._id}`,
        relatedModel: "Course",
        relatedId: course._id,
        importance: "high",
      }))
    );
  }

  res.status(201).json({ success: true, data: course });
});

exports.updateCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    return next(new ErrorResponse("Khóa học không tồn tại", 404));
  }
  if (
    course.instructorId.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    return next(
      new ErrorResponse("Không có quyền chỉnh sửa khóa học này", 403)
    );
  }
  const updatedCourse = await Course.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  // Gửi thông báo cho học viên đã đăng ký
  const enrollments = await Enrollment.find({ courseId: updatedCourse._id });
  if (enrollments.length > 0) {
    await Notification.insertMany(
      enrollments.map((enrollment) => ({
        recipient: enrollment.userId,
        sender: req.user._id,
        type: "announcement",
        title: `Cập nhật khóa học "${updatedCourse.title}"`,
        message: `Khóa học "${updatedCourse.title}" đã được cập nhật.`,
        link: `/courses/${updatedCourse._id}`,
        relatedModel: "Course",
        relatedId: updatedCourse._id,
      }))
    );
  }

  res.status(200).json({ success: true, data: updatedCourse });
});

exports.deleteCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    return next(new ErrorResponse("Khóa học không tồn tại", 404));
  }
  if (
    course.instructorId.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    return next(new ErrorResponse("Không có quyền xóa khóa học này", 403));
  }
  await Enrollment.deleteMany({ courseId: course._id });
  await course.remove();

  // Thông báo cho học viên
  const enrollments = await Enrollment.find({ courseId: course._id });
  if (enrollments.length > 0) {
    await Notification.insertMany(
      enrollments.map((enrollment) => ({
        recipient: enrollment.userId,
        sender: req.user._id,
        type: "system",
        title: `Khóa học "${course.title}" đã bị xóa`,
        message: `Khóa học "${course.title}" đã bị xóa bởi giảng viên hoặc admin.`,
        importance: "high",
      }))
    );
  }

  res.status(200).json({ success: true, data: {} });
});

exports.enrollCourse = asyncHandler(async (req, res, next) => {
  const { courseId } = req.body;
  const course = await Course.findById(courseId);
  if (!course || course.status !== "approved") {
    return next(
      new ErrorResponse("Khóa học không tồn tại hoặc chưa được phê duyệt", 404)
    );
  }

  const existingEnrollment = await Enrollment.findOne({
    userId: req.user._id,
    courseId,
  });
  if (existingEnrollment) {
    return next(new ErrorResponse("Bạn đã đăng ký khóa học này", 400));
  }

  await Enrollment.create({
    userId: req.user._id,
    courseId,
  });

  await User.findByIdAndUpdate(req.user._id, {
    $addToSet: { enrolledCourses: courseId },
  });

  // Gửi thông báo cho người dùng
  await Notification.create({
    recipient: req.user._id,
    sender: course.instructorId,
    type: "system",
    title: "Đăng ký khóa học thành công",
    message: `Bạn đã đăng ký thành công khóa học "${course.title}".`,
    link: `/courses/${course._id}`,
    relatedModel: "Course",
    relatedId: course._id,
  });

  res
    .status(200)
    .json({ success: true, data: { message: "Đăng ký thành công" } });
});

exports.createPaymentIntent = asyncHandler(async (req, res, next) => {
  const { amount } = req.body;
  const course = await Course.findById(req.params.id);
  if (!course || course.status !== "approved") {
    return next(
      new ErrorResponse("Khóa học không tồn tại hoặc chưa được phê duyệt", 404)
    );
  }
  if (course.price !== amount) {
    return next(new ErrorResponse("Số tiền không khớp", 400));
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100, // Stripe yêu cầu số tiền tính bằng đơn vị nhỏ nhất (VND không có đơn vị nhỏ hơn, nhưng vẫn nhân 100)
    currency: "vnd",
    metadata: { courseId: req.params.id, userId: req.user._id.toString() },
  });

  res
    .status(200)
    .json({ success: true, clientSecret: paymentIntent.client_secret });
});

exports.addCourseContent = asyncHandler(async (req, res, next) => {
  const { title, type, url, isPreview } = req.body;
  const course = await Course.findById(req.params.id);
  if (!course) {
    return next(new ErrorResponse("Khóa học không tồn tại", 404));
  }
  if (
    course.instructorId.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    return next(new ErrorResponse("Không có quyền thêm nội dung", 403));
  }
  course.contents.push({ title, type, url, isPreview });
  await course.save();

  // Gửi thông báo cho học viên đã đăng ký
  const enrollments = await Enrollment.find({ courseId: course._id });
  if (enrollments.length > 0) {
    await Notification.insertMany(
      enrollments.map((enrollment) => ({
        recipient: enrollment.userId,
        sender: req.user._id,
        type: "announcement",
        title: `Nội dung mới trong "${course.title}"`,
        message: `Khóa học "${course.title}" có nội dung mới: "${title}".`,
        link: `/courses/${course._id}`,
        relatedModel: "Course",
        relatedId: course._id,
      }))
    );
  }

  res.status(201).json({ success: true, data: course });
});

exports.updateCourseContent = asyncHandler(async (req, res, next) => {
  const { title, type, url, isPreview } = req.body;
  const course = await Course.findById(req.params.id);
  if (!course) {
    return next(new ErrorResponse("Khóa học không tồn tại", 404));
  }
  if (
    course.instructorId.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    return next(new ErrorResponse("Không có quyền chỉnh sửa nội dung", 403));
  }
  const content = course.contents.id(req.params.contentId);
  if (!content) {
    return next(new ErrorResponse("Nội dung không tồn tại", 404));
  }
  content.title = title || content.title;
  content.type = type || content.type;
  content.url = url || content.url;
  content.isPreview = isPreview !== undefined ? isPreview : content.isPreview;
  await course.save();
  res.status(200).json({ success: true, data: course });
});

exports.deleteCourseContent = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    return next(new ErrorResponse("Khóa học không tồn tại", 404));
  }
  if (
    course.instructorId.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    return next(new ErrorResponse("Không có quyền xóa nội dung", 403));
  }
  const content = course.contents.id(req.params.contentId);
  if (!content) {
    return next(new ErrorResponse("Nội dung không tồn tại", 404));
  }
  content.remove();
  await course.save();
  res.status(200).json({ success: true, data: course });
});

exports.updateProgress = asyncHandler(async (req, res, next) => {
  const { contentId, completed } = req.body;
  const course = await Course.findById(req.params.courseId);
  if (!course || course.status !== "approved") {
    return next(
      new ErrorResponse("Khóa học không tồn tại hoặc chưa được phê duyệt", 404)
    );
  }

  const enrollment = await Enrollment.findOne({
    userId: req.user._id,
    courseId: req.params.courseId,
  });
  if (!enrollment) {
    return next(new ErrorResponse("Bạn chưa đăng ký khóa học này", 403));
  }

  const content = course.contents.id(contentId);
  if (!content) {
    return next(new ErrorResponse("Nội dung không tồn tại", 404));
  }

  const user = await User.findById(req.user._id);
  let progress = user.progress.find(
    (p) => p.courseId.toString() === req.params.courseId
  );
  if (!progress) {
    progress = { courseId: req.params.courseId, completedContents: [] };
    user.progress.push(progress);
  }
  if (completed && !progress.completedContents.includes(contentId)) {
    progress.completedContents.push(contentId);
  } else if (!completed) {
    progress.completedContents = progress.completedContents.filter(
      (id) => id.toString() !== contentId
    );
  }
  await user.save();

  // Gửi thông báo khi hoàn thành khóa học
  if (
    progress.completedContents.length === course.contents.length &&
    !user.completedCourses.includes(req.params.courseId)
  ) {
    user.completedCourses.push(req.params.courseId);
    await user.save();
    await Notification.create({
      recipient: req.user._id,
      sender: course.instructorId,
      type: "system",
      title: "Hoàn thành khóa học",
      message: `Chúc mừng! Bạn đã hoàn thành khóa học "${course.title}".`,
      link: `/courses/${course._id}`,
      relatedModel: "Course",
      relatedId: course._id,
      importance: "high",
    });
  }

  res.status(200).json({ success: true, data: progress });
});

exports.getProgress = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const progress = user.progress.find(
    (p) => p.courseId.toString() === req.params.courseId
  );
  if (!progress) {
    return res.status(200).json({
      success: true,
      data: { courseId: req.params.courseId, completedContents: [] },
    });
  }
  res.status(200).json({ success: true, data: progress });
});

exports.createReview = asyncHandler(async (req, res, next) => {
  const { rating, comment } = req.body;
  const course = await Course.findById(req.params.courseId);
  if (!course || course.status !== "approved") {
    return next(
      new ErrorResponse("Khóa học không tồn tại hoặc chưa được phê duyệt", 404)
    );
  }

  const enrollment = await Enrollment.findOne({
    userId: req.user._id,
    courseId: req.params.courseId,
  });
  if (!enrollment) {
    return next(new ErrorResponse("Bạn chưa đăng ký khóa học này", 403));
  }

  const existingReview = await Review.findOne({
    courseId: req.params.courseId,
    userId: req.user._id,
  });
  if (existingReview) {
    return next(new ErrorResponse("Bạn đã đánh giá khóa học này", 400));
  }

  const review = await Review.create({
    courseId: req.params.courseId,
    userId: req.user._id,
    rating,
    comment,
  });

  // Gửi thông báo cho giảng viên
  await Notification.create({
    recipient: course.instructorId,
    sender: req.user._id,
    type: "system",
    title: `Đánh giá mới cho "${course.title}"`,
    message: `Khóa học "${course.title}" nhận được đánh giá mới từ ${req.user.username}.`,
    link: `/courses/${course._id}`,
    relatedModel: "Course",
    relatedId: course._id,
  });

  res.status(201).json({ success: true, data: review });
});

exports.getReviews = asyncHandler(async (req, res, next) => {
  const reviews = await Review.find({ courseId: req.params.courseId }).populate(
    "userId",
    "username avatar"
  );
  res.status(200).json({ success: true, data: reviews });
});

// Thêm controller vào exports
module.exports = {
  getCourses: exports.getCourses,
  getFeaturedCourses: exports.getFeaturedCourses,
  getCourse: exports.getCourse,
  createCourse: exports.createCourse,
  updateCourse: exports.updateCourse,
  deleteCourse: exports.deleteCourse,
  enrollCourse: exports.enrollCourse,
  createPaymentIntent: exports.createPaymentIntent,
  addCourseContent: exports.addCourseContent,
  updateCourseContent: exports.updateCourseContent,
  deleteCourseContent: exports.deleteCourseContent,
  updateProgress: exports.updateProgress,
  getProgress: exports.getProgress,
  createReview: exports.createReview,
  getReviews: exports.getReviews,
};
