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

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Xóa người dùng thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    );
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

exports.getCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate("author", "username");
    res.json({ courses });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

exports.approveCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true }
    );
    res.json({ course });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

exports.rejectCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true }
    );
    res.json({ course });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: "Xóa khóa học thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

exports.getExams = async (req, res) => {
  try {
    const exams = await Exam.find().populate("author", "username");
    res.json({ exams });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

exports.approveExam = async (req, res) => {
  try {
    const exam = await Exam.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true }
    );
    res.json({ exam });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

exports.rejectExam = async (req, res) => {
  try {
    const exam = await Exam.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true }
    );
    res.json({ exam });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

exports.deleteExam = async (req, res) => {
  try {
    await Exam.findByIdAndDelete(req.params.id);
    res.json({ message: "Xóa đề thi thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

exports.getNews = async (req, res) => {
  try {
    const news = await News.find().populate("author", "username");
    res.json({ news });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

exports.createNews = async (req, res) => {
  try {
    const { title, content, summary, category, tags, issueNumber, year } =
      req.body;
    let imageUrl, pdfUrl;

    if (req.files.image) {
      const result = await cloudinary.uploader.upload(req.files.image[0].path);
      imageUrl = result.secure_url;
    }

    if (req.files.file && category === "math-magazine") {
      const result = await cloudinary.uploader.upload(req.files.file[0].path, {
        resource_type: "raw",
      });
      pdfUrl = result.secure_url;
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

exports.updateNews = async (req, res) => {
  try {
    const { title, content, summary, category, tags, issueNumber, year } =
      req.body;
    let imageUrl, pdfUrl;

    const news = await News.findById(req.params.id);
    if (!news)
      return res.status(404).json({ message: "Không tìm thấy tin tức" });

    if (req.files.image) {
      const result = await cloudinary.uploader.upload(req.files.image[0].path);
      imageUrl = result.secure_url;
    }

    if (req.files.file && category === "math-magazine") {
      const result = await cloudinary.uploader.upload(req.files.file[0].path, {
        resource_type: "raw",
      });
      pdfUrl = result.secure_url;
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

exports.approveNews = async (req, res) => {
  try {
    const news = await News.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true }
    );
    res.json({ news });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

exports.rejectNews = async (req, res) => {
  try {
    const news = await News.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true }
    );
    res.json({ news });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

exports.deleteNews = async (req, res) => {
  try {
    await News.findByIdAndDelete(req.params.id);
    res.json({ message: "Xóa tin tức thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

exports.getDocuments = async (req, res) => {
  try {
    const documents = await Document.find().populate("uploadedBy", "username");
    res.json({ documents });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

exports.approveDocument = async (req, res) => {
  try {
    const document = await Document.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true }
    );
    res.json({ document });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

exports.rejectDocument = async (req, res) => {
  try {
    const document = await Document.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true }
    );
    res.json({ document });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    await Document.findByIdAndDelete(req.params.id);
    res.json({ message: "Xóa tài liệu thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

exports.getBookmarks = async (req, res) => {
  try {
    const bookmarks = await Bookmark.find().populate("user", "username");
    res.json({ items: bookmarks });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

exports.deleteBookmark = async (req, res) => {
  try {
    await Bookmark.findByIdAndDelete(req.params.id);
    res.json({ message: "Xóa mục thư viện thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find().populate("author", "username");
    res.json({ comments });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    await Comment.findByIdAndDelete(req.params.id);
    res.json({ message: "Xóa bình luận thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

exports.getQuestions = async (req, res) => {
  try {
    const questions = await Question.find().populate("author", "username");
    res.json({ questions });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

exports.answerQuestion = async (req, res) => {
  try {
    const { answer } = req.body;
    const question = await Question.findByIdAndUpdate(
      req.params.id,
      { answer, status: "answered" },
      { new: true }
    );
    res.json({ question });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

exports.deleteQuestion = async (req, res) => {
  try {
    await Question.findByIdAndDelete(req.params.id);
    res.json({ message: "Xóa câu hỏi thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

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

exports.getDetailedStats = async (req, res) => {
  try {
    const { period } = req.query;
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
