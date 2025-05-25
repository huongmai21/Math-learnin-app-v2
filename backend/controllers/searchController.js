const asyncHandler = require("../middleware/asyncHandler");
const Course = require("../models/Course");
const News = require("../models/News");
const Document = require("../models/Document");
const Exam = require("../models/Exam");
const User = require("../models/User");

exports.searchResources = asyncHandler(async (req, res, next) => {
  const { q, type } = req.query;
  if (!q) {
    return res
      .status(400)
      .json({ success: false, message: "Vui lòng cung cấp từ khóa tìm kiếm" });
  }

  let results = {};

  if (!type || type === "course") {
    const courses = await Course.find({
      $or: [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ],
    }).populate("instructorId", "username");
    results.courses = courses.map((course) => ({
      _id: course._id,
      title: course.title,
      description: course.description,
      type: "course",
    }));
  }

  if (!type || type === "news") {
    const news = await News.find({
      $or: [
        { title: { $regex: q, $options: "i" } },
        { content: { $regex: q, $options: "i" } },
        { summary: { $regex: q, $options: "i" } },
      ],
    }).populate("author", "username");
    results.news = news.map((item) => ({
      _id: item._id,
      title: item.title,
      description: item.summary,
      type: "news",
    }));
  }

  if (!type || type === "document") {
    const documents = await Document.find({
      $or: [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { tags: { $regex: q, $options: "i" } },
      ],
    }).populate("uploadedBy", "username");
    results.documents = documents.map((doc) => ({
      _id: doc._id,
      title: doc.title,
      description: doc.description,
      type: "document",
    }));
  }

  if (!type || type === "exam") {
    const exams = await Exam.find({
      $or: [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ],
    });
    results.exams = exams.map((exam) => ({
      _id: exam._id,
      title: exam.title,
      description: exam.description,
      type: "exam",
    }));
  }

  if (!type || type === "user") {
    const users = await User.find({
      username: { $regex: q, $options: "i" },
    });
    results.users = users.map((user) => ({
      _id: user._id,
      title: user.username,
      description: user.email || "Không có mô tả",
      type: "user",
    }));
  }

  res.status(200).json({
    success: true,
    data: type ? results[type] || [] : results,
  });
});

exports.searchAll = asyncHandler(async (req, res, next) => {
  const { q } = req.query;
  if (!q) {
    return res
      .status(400)
      .json({ success: false, message: "Vui lòng cung cấp từ khóa tìm kiếm" });
  }

  const [courses, news, documents, exams, users] = await Promise.all([
    Course.find({
      $or: [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ],
    }).populate("instructorId", "username"),
    News.find({
      $or: [
        { title: { $regex: q, $options: "i" } },
        { content: { $regex: q, $options: "i" } },
        { summary: { $regex: q, $options: "i" } },
      ],
    }).populate("author", "username"),
    Document.find({
      $or: [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { tags: { $regex: q, $options: "i" } },
      ],
    }).populate("uploadedBy", "username"),
    Exam.find({
      $or: [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ],
    }),
    User.find({
      username: { $regex: q, $options: "i" },
    }),
  ]);

  const results = [
    ...courses.map((course) => ({
      _id: course._id,
      title: course.title,
      description: course.description,
      type: "course",
    })),
    ...news.map((item) => ({
      _id: item._id,
      title: item.title,
      description: item.summary,
      type: "news",
    })),
    ...documents.map((doc) => ({
      _id: doc._id,
      title: doc.title,
      description: doc.description,
      type: "document",
    })),
    ...exams.map((exam) => ({
      _id: exam._id,
      title: exam.title,
      description: exam.description,
      type: "exam",
    })),
    ...users.map((user) => ({
      _id: user._id,
      title: user.username,
      description: user.email || "Không có mô tả",
      type: "user",
    })),
  ].slice(0, 10); // Giới hạn 10 

  res.status(200).json({
    success: true,
    data: results,
  });
});