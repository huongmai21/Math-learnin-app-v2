// backend/controllers/profileController.js
const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const Score = require("../models/Score");
const Bookmark = require("../models/Bookmark");
const Post = require("../models/Post");
const Course = require("../models/Course");
const Exam = require("../models/Exam"); // Thêm model Exam

exports.getScores = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const scores = await Score.find({ userId: req.user.id })
    .populate("examId", "title")
    .populate("courseId", "title")
    .skip(skip)
    .limit(limit);
  const total = await Score.countDocuments({ userId: req.user.id });

  res.status(200).json({
    success: true,
    data: scores,
    pagination: { page, limit, total },
  });
});

exports.getBookmarks = asyncHandler(async (req, res, next) => {
  const items = await Bookmark.find({ userId: req.user.id });
  res.status(200).json({ success: true, data: items });
});

exports.getPosts = asyncHandler(async (req, res, next) => {
  const posts = await Post.find({ userId: req.user.id });
  res.status(200).json({ success: true, data: posts });
});

exports.getCourses = asyncHandler(async (req, res, next) => {
  const { role } = req.user;
  let courses;
  if (role === "student") {
    courses = await Course.find({ students: req.user.id }).populate(
      "instructorId",
      "username"
    );
  } else if (role === "teacher" || role === "admin") {
    courses = await Course.find({ instructorId: req.user.id }).populate(
      "students",
      "username"
    );
  }
  res.status(200).json({ success: true, data: courses });
});

exports.addBookmark = asyncHandler(async (req, res, next) => {
  const { title, type, url } = req.body;
  const item = await Bookmark.create({
    userId: req.user.id,
    title,
    type,
    url,
  });
  res.status(201).json({ success: true, data: item });
});

exports.createPost = asyncHandler(async (req, res, next) => {
  const { title, content, type } = req.body;
  const post = await Post.create({
    userId: req.user.id,
    title,
    content,
    type,
  });
  res.status(201).json({ success: true, data: post });
});

exports.enrollCourse = asyncHandler(async (req, res, next) => {
  const { courseId } = req.body;
  const course = await Course.findById(courseId);
  if (!course) {
    return next(new ErrorResponse("Khóa học không tồn tại", 404));
  }
  if (!course.students.includes(req.user.id)) {
    course.students.push(req.user.id);
    await course.save();
  }
  res
    .status(200)
    .json({ success: true, message: "Đăng ký khóa học thành công" });
});

exports.createCourse = asyncHandler(async (req, res, next) => {
  const { title, description, price } = req.body;
  const course = await Course.create({
    title,
    description,
    price,
    instructorId: req.user.id,
  });
  res.status(201).json({ success: true, data: course });
});

exports.getParticipatedExams = asyncHandler(async (req, res, next) => {
  if (req.user.role !== "student") {
    return next(new ErrorResponse("Chỉ học sinh có thể xem đề thi đã tham gia", 403));
  }
  const scores = await Score.find({ userId: req.user.id }).populate("examId");
  const participatedExams = scores
    .filter((score) => score.examId)
    .map((score) => ({
      _id: score.examId._id,
      title: score.examId.title,
      subject: score.examId.subject,
      score: score.score,
      startTime: score.examId.startTime,
      endTime: score.examId.endTime,
    }));
  res.status(200).json({ success: true, data: participatedExams });
});

exports.getAchievements = asyncHandler(async (req, res, next) => {
  const scores = await Score.find({ userId: req.user.id });
  const totalExams = scores.length;
  const perfectScores = scores.filter((s) => s.score === 100).length;

  const achievements = [];
  if (totalExams >= 10) {
    achievements.push({ name: "Hoàn thành 10 bài thi", badge: "exam-master" });
  }
  if (perfectScores >= 1) {
    achievements.push({ name: "Đạt điểm 100", badge: "perfect-score" });
  }

  res.status(200).json({ success: true, data: achievements });
});