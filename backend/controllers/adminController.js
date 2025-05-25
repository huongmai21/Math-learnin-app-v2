// adminController.js
const User = require("../models/User");
const Course = require("../models/Course");
const Exam = require("../models/Exam");
const News = require("../models/News");
const Document = require("../models/Document");
const Bookmark = require("../models/Bookmark");
const Comment = require("../models/Comment");
const Question = require("../models/Question");
const cloudinary = require("../config/cloudinary");
const fs = require("fs").promises; // For cleaning up temporary files

// Validation helper
const validateRequiredFields = (fields, data) => {
  const missing = fields.filter((field) => !data[field]);
  if (missing.length) {
    throw new Error(`Missing required fields: ${missing.join(", ")}`);
  }
};

// Get users with filtering
exports.getUsers = async (req, res) => {
  try {
    const { search, role, status } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (role) query.role = role;
    if (status) query.status = status;

    const users = await User.find(query).select("-password");
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }
    res.json({ message: "Xóa người dùng thành công", user });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Update user role
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!["admin"].includes(role)) {
      return res.status(400).json({ message: "Vai trò không hợp lệ" });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Get courses with filtering
exports.getCourses = async (req, res) => {
  try {
    const { search, status, category } = req.query;
    const query = {};
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }
    if (status) query.status = status;
    if (category) query.category = category;

    const courses = await Course.find(query).populate("author", "username");
    res.json({ courses });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Create course
exports.createCourse = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    validateRequiredFields(["title", "description", "category"], req.body);

    let imageUrl;
    if (req.files?.image) {
      const result = await cloudinary.uploader.upload(req.files.image[0].path);
      imageUrl = result.secure_url;
      await fs.unlink(req.files.image[0].path).catch(() => {}); // Clean up temp file
    }

    const course = new Course({
      title,
      description,
      category,
      author: req.user._id,
      status: "pending",
      image: imageUrl,
    });

    await course.save();
    res.status(201).json({ course });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Update course
exports.updateCourse = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Không tìm thấy khóa học" });
    }

    let imageUrl;
    if (req.files?.image) {
      const result = await cloudinary.uploader.upload(req.files.image[0].path);
      imageUrl = result.secure_url;
      await fs.unlink(req.files.image[0].path).catch(() => {}); // Clean up temp file
    }

    course.title = title || course.title;
    course.description = description || course.description;
    course.category = category || course.category;
    course.image = imageUrl || course.image;

    await course.save();
    res.json({ course });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Approve course
exports.approveCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true }
    );
    if (!course) {
      return res.status(404).json({ message: "Không tìm thấy khóa học" });
    }
    res.json({ course });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Reject course
exports.rejectCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true }
    );
    if (!course) {
      return res.status(404).json({ message: "Không tìm thấy khóa học" });
    }
    res.json({ course });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Delete course
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Không tìm thấy khóa học" });
    }
    res.json({ message: "Xóa khóa học thành công", course });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Get exams with filtering
exports.getExams = async (req, res) => {
  try {
    const { search, status, subject } = req.query;
    const query = {};
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }
    if (status) query.status = status;
    if (subject) query.subject = subject;

    const exams = await Exam.find(query).populate("author", "username");
    res.json({ exams });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Approve exam
exports.approveExam = async (req, res) => {
  try {
    const exam = await Exam.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true }
    );
    if (!exam) {
      return res.status(404).json({ message: "Không tìm thấy đề thi" });
    }
    res.json({ exam });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Reject exam
exports.rejectExam = async (req, res) => {
  try {
    const exam = await Exam.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true }
    );
    if (!exam) {
      return res.status(404).json({ message: "Không tìm thấy đề thi" });
    }
    res.json({ exam });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Delete exam
exports.deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findByIdAndDelete(req.params.id);
    if (!exam) {
      return res.status(404).json({ message: "Không tìm thấy đề thi" });
    }
    res.json({ message: "Xóa đề thi thành công", exam });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Get news with filtering
exports.getNews = async (req, res) => {
  try {
    const { search, status, category } = req.query;
    const query = {};
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }
    if (status) query.status = status;
    if (category) query.category = category;

    const news = await News.find(query).populate("author", "username");
    res.json({ news });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Create news
exports.createNews = async (req, res) => {
  try {
    const { title, content, summary, category, tags, issueNumber, year } =
      req.body;
    validateRequiredFields(["title", "content", "category"], req.body);

    let imageUrl, pdfUrl;
    if (req.files?.image) {
      const result = await cloudinary.uploader.upload(req.files.image[0].path);
      imageUrl = result.secure_url;
      await fs.unlink(req.files.image[0].path).catch(() => {});
    }

    if (req.files?.file && category === "math-magazine") {
      const result = await cloudinary.uploader.upload(req.files.file[0].path, {
        resource_type: "raw",
      });
      pdfUrl = result.secure_url;
      await fs.unlink(req.files.file[0].path).catch(() => {});
    }

    if (!req.user?._id) {
      return res.status(401).json({ message: "Không tìm thấy thông tin người dùng" });
    }

    const news = new News({
      title,
      content,
      summary,
      category,
      tags: tags ? JSON.parse(tags) : [],
      author: req.user._id,
      status: "pending",
      image: imageUrl,
      file: pdfUrl,
      issueNumber: category === "math-magazine" ? issueNumber : undefined,
      year: category === "math-magazine" ? year : undefined,
    });

    await news.save();
    res.status(201).json({ news });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Update news
exports.updateNews = async (req, res) => {
  try {
    const { title, content, summary, category, tags, issueNumber, year } =
      req.body;
    const news = await News.findById(req.params.id);
    if (!news) {
      return res.status(404).json({ message: "Không tìm thấy tin tức" });
    }

    let imageUrl, pdfUrl;
    if (req.files?.image) {
      const result = await cloudinary.uploader.upload(req.files.image[0].path);
      imageUrl = result.secure_url;
      await fs.unlink(req.files.image[0].path).catch(() => {});
    }

    if (req.files?.file && category === "math-magazine") {
      const result = await cloudinary.uploader.upload(req.files.file[0].path, {
        resource_type: "raw",
      });
      pdfUrl = result.secure_url;
      await fs.unlink(req.files.file[0].path).catch(() => {});
    }

    news.title = title || news.title;
    news.content = content || news.content;
    news.summary = summary || news.summary;
    news.category = category || news.category;
    news.tags = tags ? JSON.parse(tags) : news.tags;
    news.image = imageUrl || news.image;
    news.file = pdfUrl || news.file;
    news.issueNumber =
      category === "math-magazine" ? issueNumber : news.issueNumber;
    news.year = category === "math-magazine" ? year : news.year;

    await news.save();
    res.json({ news });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Approve news
exports.approveNews = async (req, res) => {
  try {
    const news = await News.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true }
    );
    if (!news) {
      return res.status(404).json({ message: "Không tìm thấy tin tức" });
    }
    res.json({ news });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Reject news
exports.rejectNews = async (req, res) => {
  try {
    const news = await News.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true }
    );
    if (!news) {
      return res.status(404).json({ message: "Không tìm thấy tin tức" });
    }
    res.json({ news });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Delete news
exports.deleteNews = async (req, res) => {
  try {
    const news = await News.findByIdAndDelete(req.params.id);
    if (!news) {
      return res.status(404).json({ message: "Không tìm thấy tin tức" });
    }
    res.json({ message: "Xóa tin tức thành công", news });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Get documents with filtering
exports.getDocuments = async (req, res) => {
  try {
    const { search, status, category } = req.query;
    const query = {};
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }
    if (status) query.status = status;
    if (category) query.category = category;

    const documents = await Document.find(query).populate("uploadedBy", "username");
    res.json({ documents });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Create document
exports.createDocument = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    validateRequiredFields(["title", "category"], req.body);

    let fileUrl;
    if (req.files?.file) {
      const result = await cloudinary.uploader.upload(req.files.file[0].path, {
        resource_type: "raw",
      });
      fileUrl = result.secure_url;
      await fs.unlink(req.files.file[0].path).catch(() => {});
    } else {
      return res.status(400).json({ message: "Thiếu tệp tài liệu" });
    }

    const document = new Document({
      title,
      description,
      category,
      uploadedBy: req.user._id,
      status: "pending",
      file: fileUrl,
    });

    await document.save();
    res.status(201).json({ document });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Update document
exports.updateDocument = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: "Không tìm thấy tài liệu" });
    }

    let fileUrl;
    if (req.files?.file) {
      const result = await cloudinary.uploader.upload(req.files.file[0].path, {
        resource_type: "raw",
      });
      fileUrl = result.secure_url;
      await fs.unlink(req.files.file[0].path).catch(() => {});
    }

    document.title = title || document.title;
    document.description = description || document.description;
    document.category = category || document.category;
    document.file = fileUrl || document.file;

    await document.save();
    res.json({ document });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Approve document
exports.approveDocument = async (req, res) => {
  try {
    const document = await Document.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true }
    );
    if (!document) {
      return res.status(404).json({ message: "Không tìm thấy tài liệu" });
    }
    res.json({ document });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Reject document
exports.rejectDocument = async (req, res) => {
  try {
    const document = await Document.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true }
    );
    if (!document) {
      return res.status(404).json({ message: "Không tìm thấy tài liệu" });
    }
    res.json({ document });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Delete document
exports.deleteDocument = async (req, res) => {
  try {
    const document = await Document.findByIdAndDelete(req.params.id);
    if (!document) {
      return res.status(404).json({ message: "Không tìm thấy tài liệu" });
    }
    res.json({ message: "Xóa tài liệu thành công", document });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Get bookmarks
exports.getBookmarks = async (req, res) => {
  try {
    const bookmarks = await Bookmark.find().populate("user", "username");
    res.json({ bookmarks }); // Changed from { items: bookmarks } for consistency
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Delete bookmark
exports.deleteBookmark = async (req, res) => {
  try {
    const bookmark = await Bookmark.findByIdAndDelete(req.params.id);
    if (!bookmark) {
      return res.status(404).json({ message: "Không tìm thấy mục thư viện" });
    }
    res.json({ message: "Xóa mục thư viện thành công", bookmark });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Get comments with filtering
exports.getComments = async (req, res) => {
  try {
    const { search, postType } = req.query;
    const query = {};
    if (search) {
      query.content = { $regex: search, $options: "i" };
    }
    if (postType) query.postType = postType;

    const comments = await Comment.find(query).populate("author", "username");
    res.json({ comments });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Delete comment
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findByIdAndDelete(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: "Không tìm thấy bình luận" });
    }
    res.json({ message: "Xóa bình luận thành công", comment });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Get questions with filtering
exports.getQuestions = async (req, res) => {
  try {
    const { search, status } = req.query;
    const query = {};
    if (search) {
      query.content = { $regex: search, $options: "i" };
    }
    if (status) query.status = status;

    const questions = await Question.find(query).populate("author", "username");
    res.json({ questions });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Answer question
exports.answerQuestion = async (req, res) => {
  try {
    const { answer } = req.body;
    if (!answer) {
      return res.status(400).json({ message: "Thiếu nội dung trả lời" });
    }
    const question = await Question.findByIdAndUpdate(
      req.params.id,
      { answer, status: "answered" },
      { new: true }
    );
    if (!question) {
      return res.status(404).json({ message: "Không tìm thấy câu hỏi" });
    }
    res.json({ question });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Delete question
exports.deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) {
      return res.status(404).json({ message: "Không tìm thấy câu hỏi" });
    }
    res.json({ message: "Xóa câu hỏi thành công", question });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Get stats
exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCourses = await Course.countDocuments();
    const totalExams = await Exam.countDocuments();
    const totalNews = await News.countDocuments();
    const totalDocuments = await Document.countDocuments();
    const totalPosts = await Comment.countDocuments();

    res.json({
      totalUsers,
      totalCourses,
      totalExams,
      totalNews,
      totalDocuments,
      totalPosts,
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Get detailed stats
exports.getDetailedStats = async (req, res) => {
  try {
    const { period } = req.query;
    if (!["week", "month", "year"].includes(period)) {
      return res.status(400).json({ message: "Khoảng thời gian không hợp lệ" });
    }
    const days = period === "year" ? 365 : period === "month" ? 30 : 7;

    const newUsers = await User.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
          },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const activities = await Comment.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
          },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      newUsers: newUsers.map((item) => ({ date: item._id, count: item.count })),
      activities: activities.map((item) => ({
        date: item._id,
        count: item.count,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Get news stats
exports.getNewsStats = async (req, res) => {
  try {
    const viewsByCategory = await News.aggregate([
      {
        $group: {
          _id: "$category",
          views: { $sum: "$views" },
        },
      },
      {
        $project: {
          category: "$_id",
          views: 1,
          _id: 0,
        },
      },
    ]);

    res.json({ viewsByCategory });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};