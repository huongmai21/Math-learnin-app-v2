const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const {
  Exam,
  ExamResult,
  ExamQuestion,
  Course,
  Notification,
  User,
  Enrollment,
} = require("../models");

//Lấy danh sách đề thi công khai
exports.getAllExams = asyncHandler(async (req, res, next) => {
  const {
    page = 1,
    limit = 6,
    search,
    educationLevel,
    subject,
    difficulty,
    status,
    isPublic,
  } = req.query;
  const query = { isPublic: isPublic === "true" || true };

  if (search) query.title = { $regex: search, $options: "i" };
  if (educationLevel) query.educationLevel = educationLevel;
  if (subject) query.subject = subject;
  if (difficulty) query.difficulty = difficulty;
  if (status) {
    const now = new Date();
    if (status === "upcoming") query.startTime = { $gt: now };
    else if (status === "ongoing") {
      query.startTime = { $lte: now };
      query.endTime = { $gte: now };
    } else if (status === "ended") query.endTime = { $lt: now };
  }

  const exams = await Exam.find(query)
    .populate("author", "username avatar")
    .populate("questions")
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Exam.countDocuments(query);
  res.status(200).json({
    success: true,
    data: exams,
    totalPages: Math.ceil(total / limit),
    currentPage: Number(page),
  });
});

// Theo dõi đề thi
exports.followExam = asyncHandler(async (req, res) => {
  const exam = await Exam.findById(req.params.id);
  if (!exam) {
    return res
      .status(404)
      .json({ success: false, message: "Không tìm thấy đề thi!" });
  }

  if (exam.followers.includes(req.user.id)) {
    return res
      .status(400)
      .json({ success: false, message: "Bạn đã quan tâm bài thi này!" });
  }

  exam.followers.push(req.user.id);
  await exam.save();

  const reminderTime = new Date(exam.startTime.getTime() - 30 * 60 * 1000);
  if (reminderTime > new Date()) {
    try {
      const notification = new Notification({
        recipient: req.user.id,
        type: "new_exam",
        title: "Nhắc nhở bài thi",
        message: `Bài thi "${
          exam.title
        }" sẽ bắt đầu lúc ${exam.startTime.toLocaleString()}.`,
        link: `/exams/${exam._id}`,
        relatedModel: "Exam",
        relatedId: exam._id,
        importance: "high",
        createdAt: reminderTime,
      });
      await notification.save();
      global.io.to(req.user.id).emit("newNotifications", notification);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Không thể tạo thông báo nhắc nhở",
        error: error.message,
      });
    }
  }

  res
    .status(200)
    .json({ success: true, message: "Quan tâm bài thi thành công!" });
});

// Xem đáp án của đề thi
exports.getExamAnswers = asyncHandler(async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id).populate("questions");
    if (!exam) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy đề thi!" });
    }

    const now = new Date();
    if (exam.endTime > now) {
      return res
        .status(403)
        .json({ success: false, message: "Bài thi chưa kết thúc!" });
    }

    res.status(200).json({
      success: true,
      exam: {
        title: exam.title,
        questions: exam.questions,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Không thể lấy đáp án!",
      error: error.message,
    });
  }
});

// Gợi ý bài thi dựa trên kết quả đã làm
exports.getRecommendedExams = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    const user = req.user;

    const examResults = await ExamResult.find({ user: userId }).populate(
      "exam"
    );

    const preferredLevels = [
      ...new Set(examResults.map((result) => result.exam.educationLevel)),
    ];
    const preferredSubjects = [
      ...new Set(examResults.map((result) => result.exam.subject)),
    ];

    let recommendedExams = await Exam.find({
      isPublic: true,
      educationLevel: {
        $in:
          preferredLevels.length > 0
            ? preferredLevels
            : ["grade1", "university"],
      },
      subject: {
        $in: preferredSubjects.length > 0 ? preferredSubjects : ["math"],
      },
      _id: { $nin: examResults.map((result) => result.exam._id) },
    })
      .sort({ attempts: -1 })
      .limit(5);

    if (recommendedExams.length === 0) {
      recommendedExams = await Exam.find({
        isPublic: true,
        educationLevel: user.educationLevel || "university",
      })
        .sort({ attempts: -1 })
        .limit(5);
    }

    res.status(200).json({
      success: true,
      recommendedExams,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Không thể gợi ý bài thi!",
      error: error.message,
    });
  }
});

// Tạo đề thi mới
exports.createExam = asyncHandler(async (req, res) => {
  try {
    const {
      title,
      description,
      educationLevel,
      subject,
      duration,
      questions,
      startTime,
      endTime,
      difficulty,
    } = req.body;

    const exam = new Exam({
      title,
      description,
      author: req.user.id,
      educationLevel,
      subject,
      duration: duration || 60,
      questions,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      difficulty,
      isPublic: true,
    });

    await exam.save();
    res.status(201).json({
      success: true,
      message: "Tạo đề thi thành công!",
      exam,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Không thể tạo đề thi!",
      error: error.message,
    });
  }
});

// Cập nhật đề thi
exports.updateExam = asyncHandler(async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy đề thi!" });
    }

    if (exam.author.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền chỉnh sửa đề thi này!",
      });
    }

    const updatedData = { ...req.body };
    if (updatedData.startTime)
      updatedData.startTime = new Date(updatedData.startTime);
    if (updatedData.endTime)
      updatedData.endTime = new Date(updatedData.endTime);

    const updatedExam = await Exam.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    );
    res.status(200).json({
      success: true,
      message: "Cập nhật đề thi thành công!",
      exam: updatedExam,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Không thể cập nhật đề thi!",
      error: error.message,
    });
  }
});
// Xóa đề thi
exports.deleteExam = asyncHandler(async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy đề thi!" });
    }

    if (exam.author.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền xóa đề thi này!",
      });
    }

    await Exam.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      message: "Xóa đề thi thành công!",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Không thể xóa đề thi!",
      error: error.message,
    });
  }
});

//  Lấy bảng xếp hạng toàn cầu
exports.getGlobalLeaderboard = asyncHandler(async (req, res) => {
  try {
    const { educationLevel, subject, timeRange } = req.query;

    let matchQuery = {};
    if (educationLevel) matchQuery["exam.educationLevel"] = educationLevel;
    if (subject) matchQuery["exam.subject"] = subject;
    if (timeRange) {
      const now = new Date();
      let startDate;
      if (timeRange === "weekly") {
        startDate = new Date(now.setDate(now.getDate() - 7));
      } else if (timeRange === "monthly") {
        startDate = new Date(
          now.setFullYear(now.getFullYear(), now.getMonth() - 1)
        );
      }
      matchQuery.endTime = { $gte: startDate };
    }

    const leaderboard = await ExamResult.aggregate([
      {
        $lookup: {
          from: "exams",
          localField: "exam",
          foreignField: "_id",
          as: "exam",
        },
      },
      { $unwind: "$exam" },
      { $match: matchQuery },
      {
        $group: {
          _id: "$user",
          totalScore: { $sum: "$totalScore" },
          totalExams: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          username: "$user.username",
          totalScore: 1,
          totalExams: 1,
        },
      },
      { $sort: { totalScore: -1 } },
      { $limit: 10 },
    ]);

    const badgeTypes = ["gold", "silver", "bronze"];
    for (let i = 0; i < Math.min(3, leaderboard.length); i++) {
      const user = await User.findById(leaderboard[i]._id);
      if (!user.badges.some((badge) => badge.type === badgeTypes[i])) {
        user.badges.push({ type: badgeTypes[i] });
        await user.save();
      }
      leaderboard[i].badge = badgeTypes[i];
    }

    res.status(200).json({
      success: true,
      leaderboard,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Không thể lấy bảng xếp hạng!",
      error: error.message,
    });
  }
});

// Lấy bảng xếp hạng của một bài thi cụ thể
exports.getExamLeaderboard = asyncHandler(async (req, res) => {
  try {
    const examId = req.params.id;
    const leaderboard = await ExamResult.find({ exam: examId })
      .populate("user", "username")
      .sort({ totalScore: -1, endTime: 1 })
      .limit(10)
      .select("user totalScore endTime");

    res.status(200).json({
      success: true,
      leaderboard,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Không thể lấy bảng xếp hạng bài thi!",
      error: error.message,
    });
  }
});

// Nộp bài thi
exports.submitExam = asyncHandler(async (req, res, next) => {
  const exam = await Exam.findById(req.params.examId).populate("questions");
  if (!exam) {
    return next(new ErrorResponse("Bài thi không tồn tại", 404));
  }
  const now = new Date();
  if (now < exam.startTime || now > exam.endTime) {
    return next(new ErrorResponse("Bài thi không khả dụng", 400));
  }
  const { answers } = req.body;
  let totalScore = 0;

  const submissionAnswers = [];
  for (const question of exam.questions) {
    const userAnswer = answers[question._id.toString()];
    let isCorrect = false;
    let questionScore = 0;

    if (
      question.questionType === "multiple-choice" &&
      userAnswer !== undefined
    ) {
      isCorrect = Number(userAnswer) === question.correctAnswer;
      questionScore = isCorrect ? question.score : 0;
    } else if (
      question.questionType === "true-false" &&
      userAnswer !== undefined
    ) {
      isCorrect = userAnswer === question.correctAnswer;
      questionScore = isCorrect ? question.score : 0;
    } else if (
      question.questionType === "fill-in" &&
      userAnswer !== undefined
    ) {
      isCorrect =
        userAnswer.trim().toLowerCase() ===
        question.correctAnswer.trim().toLowerCase();
      questionScore = isCorrect ? question.score : 0;
    } else if (
      question.questionType === "essay" ||
      question.questionType === "math-equation"
    ) {
      questionScore = 0; // Chờ chấm tay
    }
    totalScore += questionScore;

    if (question.questionType === "essay" && userAnswer && userAnswer.url) {
      submissionAnswers.push({
        question: question._id,
        userAnswer: userAnswer.url, // Lưu URL file từ Cloudinary
        isCorrect: false,
        score: 0,
      });
    } else {
      submissionAnswers.push({
        question: question._id,
        userAnswer: userAnswer || "",
        isCorrect,
        score: questionScore,
      });
    }
  }

  const examResult = await ExamResult.create({
    exam: exam._id,
    user: req.user._id,
    answers: submissionAnswers,
    totalScore,
    startTime: now,
    endTime: now,
    completed: true,
  });

  exam.submissions.push(examResult._id);
  await exam.save();

  res.status(200).json({
    success: true,
    data: {
      score: totalScore,
      total: exam.questions.reduce((sum, q) => sum + q.score, 0),
    },
  });
});

// Cập nhật điểm số bài nộp
exports.updateSubmissionScore = asyncHandler(async (req, res, next) => {
  const exam = await Exam.findById(req.params.examId);
  if (!exam) {
    return next(new ErrorResponse("Bài thi không tồn tại", 404));
  }
  if (
    exam.author.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    return next(new ErrorResponse("Không có quyền chấm bài", 403));
  }

  const submission = exam.submissions.id(req.params.submissionId);
  if (!submission) {
    return next(new ErrorResponse("Bài nộp không tồn tại", 404));
  }

  const grades = req.body;
  let totalScore = 0;

  for (const [questionId, score] of Object.entries(grades)) {
    if (submission.answers[questionId]) {
      submission.answers[questionId].score = score;
      totalScore += score;
    }
  }

  submission.totalScore = totalScore;
  await exam.save();

  res.status(200).json({ success: true, data: exam });
});

// Tạo bài thi cho khóa học
exports.createExamForCourse = asyncHandler(async (req, res, next) => {
  const {
    title,
    description,
    educationLevel,
    subject,
    duration,
    questions,
    startTime,
    endTime,
    difficulty,
    maxAttempts,
  } = req.body;
  const courseId = req.params.courseId;

  const course = await Course.findById(courseId);
  if (!course || course.status !== "approved") {
    return next(
      new ErrorResponse("Khóa học không tồn tại hoặc chưa được phê duyệt", 404)
    );
  }

  if (
    course.instructorId.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    return next(new ErrorResponse("Không có quyền tạo bài thi", 403));
  }

  // questions = await ExamQuestion.find({
  //   _id: { $in: req.body.questions },
  // });
  // const totalScore = questions.reduce((sum, q) => sum + q.score, 0);

  const exam = await Exam.create({
    title,
    description,
    educationLevel,
    subject,
    duration,
    questions,
    startTime,
    endTime,
    difficulty,
    maxAttempts,
    author: req.user._id,
    courseId,
  });

  // Thông báo cho học viên đã đăng ký
  const enrollments = await Enrollment.find({ courseId });
  if (enrollments.length > 0) {
    try {
      const notifications = await Notification.insertMany(
        enrollments.map((enrollment) => ({
          recipient: enrollment.userId,
          sender: req.user._id,
          type: "announcement",
          title: `Bài thi mới trong "${course.title}"`,
          message: `Khóa học "${course.title}" có bài thi mới: "${title}".`,
          link: `/courses/${course._id}/exams/${exam._id}`,
          relatedModel: "Exam",
          relatedId: exam._id,
          importance: "normal",
        }))
      );
      notifications.forEach((notif) => {
        global.io
          .to(notif.recipient.toString())
          .emit("newNotifications", notif);
      });
    } catch (error) {
      return next(new ErrorResponse("Không thể gửi thông báo", 500));
    }
  }

  res.status(201).json({ success: true, data: exam });
});

// Tham gia bài thi
exports.takeExam = asyncHandler(async (req, res, next) => {
  const exam = await Exam.findById(req.params.examId);
  if (!exam) {
    return next(new ErrorResponse("Bài thi không tồn tại", 404));
  }

  // Kiểm tra xem bài thi có thuộc khóa học không
  if (exam.courseId) {
    const enrollment = await Enrollment.findOne({
      userId: req.user._id,
      courseId: exam.courseId,
    });
    if (!enrollment) {
      return next(
        new ErrorResponse("Bạn chưa đăng ký khóa học để tham gia bài thi", 403)
      );
    }
  }

  const now = new Date();
  if (now < exam.startTime || now > exam.endTime) {
    return next(
      new ErrorResponse("Bài thi không khả dụng vào thời điểm này", 400)
    );
  }

  const examResult = await ExamResult.findOne({
    exam: exam._id,
    user: req.user._id,
  });
  if (examResult && exam.attempts >= exam.maxAttempts) {
    return next(new ErrorResponse("Bạn đã hết lượt làm bài", 400));
  }

  exam.attempts += 1;
  await exam.save();

  res.status(200).json({ success: true, data: exam });
});

// Lấy danh sách bài thi của khóa học
exports.getExamsByCourse = asyncHandler(async (req, res, next) => {
  const courseId = req.params.courseId;
  const exams = await Exam.find({ courseId }).populate("author", "username");
  res.status(200).json({ success: true, data: exams });
});

// Thêm câu hỏi vào bài thi
exports.addQuestionToExam = asyncHandler(async (req, res, next) => {
  const exam = await Exam.findById(req.params.examId);
  if (!exam) {
    return next(new ErrorResponse("Bài thi không tồn tại", 404));
  }
  if (exam.author.toString() !== req.user._id.toString()) {
    return next(new ErrorResponse("Không có quyền thêm câu hỏi", 403));
  }
  const question = await ExamQuestion.create({
    ...req.body,
    createdBy: req.user._id,
  });
  exam.questions.push(question._id);
  await exam.save();
  res.status(201).json({ success: true, data: exam });
});

// Cập nhật câu hỏi trong bài thi
exports.updateQuestionInExam = asyncHandler(async (req, res, next) => {
  const exam = await Exam.findById(req.params.examId);
  if (!exam) {
    return next(new ErrorResponse("Bài thi không tồn tại", 404));
  }
  if (
    exam.author.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    return next(new ErrorResponse("Không có quyền chỉnh sửa câu hỏi", 403));
  }
  const question = await ExamQuestion.findById(req.params.questionId);
  if (!question) {
    return next(new ErrorResponse("Câu hỏi không tồn tại", 404));
  }
  await ExamQuestion.findByIdAndUpdate(req.params.questionId, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ success: true, data: exam });
});

// Xóa câu hỏi khỏi bài thi
exports.deleteQuestionFromExam = asyncHandler(async (req, res, next) => {
  const exam = await Exam.findById(req.params.examId);
  if (!exam) {
    return next(new ErrorResponse("Bài thi không tồn tại", 404));
  }
  if (
    exam.author.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    return next(new ErrorResponse("Không có quyền xóa câu hỏi", 403));
  }
  const questionId = req.params.questionId;
  if (!exam.questions.includes(questionId)) {
    return next(new ErrorResponse("Câu hỏi không tồn tại trong bài thi", 404));
  }
  exam.questions = exam.questions.filter((q) => q.toString() !== questionId);
  await exam.save();
  await ExamQuestion.findByIdAndDelete(questionId);
  res.status(200).json({ success: true, data: exam });
});

// Lấy danh sách câu hỏi của bài thi
exports.getExamQuestions = asyncHandler(async (req, res, next) => {
  const { tags, difficulty, questionType } = req.query;
  const query = { createdBy: req.user._id };
  if (tags) query.tags = { $in: tags.split(",") };
  if (difficulty) query.difficulty = difficulty;
  if (questionType) query.questionType = questionType;
  const questions = await ExamQuestion.find(query);
  res.status(200).json({ success: true, data: questions });
});

// Lấy danh sách bài nộp của bài thi
exports.getExamSubmissions = asyncHandler(async (req, res, next) => {
  const exam = await Exam.findById(req.params.examId).select("submissions");
  if (!exam) {
    return next(new ErrorResponse("Bài thi không tồn tại", 404));
  }
  if (
    exam.author.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    return next(new ErrorResponse("Không có quyền xem bài nộp", 403));
  }
  res.status(200).json({ success: true, data: exam.submissions });
});

// Lấy kết quả bài thi của người dùng
exports.getUserExamResult = asyncHandler(async (req, res, next) => {
  const result = await ExamResult.findOne({
    exam: req.params.examId,
    user: req.user._id,
  }).populate("exam questions.question");
  if (!result) {
    return next(new ErrorResponse("Không tìm thấy kết quả bài thi", 404));
  }
  res.status(200).json({ success: true, data: result });
});

exports.createReminder = asyncHandler(async (req, res, next) => {
  const { examId } = req.params;
  const userId = req.user._id;

  const exam = await Exam.findById(examId);
  if (!exam) return next(new ErrorResponse("Bài thi không tồn tại", 404));
  if (new Date(exam.startTime) < new Date()) {
    return next(new ErrorResponse("Bài thi đã bắt đầu hoặc kết thúc", 400));
  }

  const existingNotification = await Notification.findOne({
    recipient: userId,
    type: "new_exam",
    relatedModel: "Exam",
    relatedId: examId,
  });

  if (existingNotification) {
    return next(new ErrorResponse("Đã bật nhắc nhở cho bài thi này", 400));
  }

  try {
    const notification = await Notification.create({
      recipient: userId,
      type: "new_exam",
      title: `Nhắc nhở bài thi: ${exam.title}`,
      message: `Bài thi "${exam.title}" sẽ bắt đầu vào ${new Date(
        exam.startTime
      ).toLocaleString("vi-VN")}`,
      link: `/exams/${examId}`,
      relatedModel: "Exam",
      relatedId: examId,
      importance: "high",
    });

    global.io.to(userId).emit("newNotifications", notification);
    res.status(201).json({ success: true, data: notification });
  } catch (error) {
    return next(new ErrorResponse("Không thể tạo thông báo nhắc nhở", 500));
  }
});

exports = {
  getAllExams: exports.getAllExams,
  followExam: exports.followExam,
  getExamAnswers: exports.getExamAnswers,
  getRecommendedExams: exports.getRecommendedExams,
  createExam: exports.createExam,
  updateExam: exports.updateExam,
  deleteExam: exports.deleteExam,
  getGlobalLeaderboard: exports.getGlobalLeaderboard,
  getExamLeaderboard: exports.getExamLeaderboard,
  submitExam: exports.submitExam,
  createExamForCourse: exports.createExamForCourse,
  getExamsByCourse: exports.getExamsByCourse,
  takeExam: exports.takeExam,
  updateSubmissionScore: exports.updateSubmissionScore,
  addQuestionToExam: exports.addQuestionToExam,
  updateQuestionInExam: exports.updateQuestionInExam,
  deleteQuestionFromExam: exports.deleteQuestionFromExam,
  getExamSubmissions: exports.getExamSubmissions,
  getExamQuestions: exports.getExamQuestions,
  getUserExamResult: exports.getUserExamResult,
  createReminder: exports.createReminder,
};
