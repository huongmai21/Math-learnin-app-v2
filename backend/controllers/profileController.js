const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const {Post, Bookmark} = require("../models");


exports.getScores = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const scores = await ExamResult.find({ userId: req.user.id })
    .populate("examId", "title")
    .populate("courseId", "title")
    .skip(skip)
    .limit(limit);
  const total = await ExamResult.countDocuments({ userId: req.user.id });

  res.status(200).json({
    success: true,
    data: scores || [],
    pagination: { page, limit, total },
  });
});

exports.getBookmarks = asyncHandler(async (req, res, next) => {
  const items = await Bookmark.find({ userId: req.user.id });
  res.status(200).json({ success: true, data: items || [] });
});

exports.getPosts = asyncHandler(async (req, res, next) => {
  const posts = await Post.find({ userId: req.user.id });
  res.status(200).json({ success: true, data: posts || [] });
});


exports.addBookmark = asyncHandler(async (req, res, next) => {
  const { title, type, url } = req.body;
  if (!title || !type || !url) {
    return next(new ErrorResponse("Thiếu thông tin cần thiết", 400));
  }
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
  if (!title || !content || !type) {
    return next(new ErrorResponse("Thiếu thông tin cần thiết", 400));
  }
  const post = await Post.create({
    userId: req.user.id,
    title,
    content,
    type,
  });
  res.status(201).json({ success: true, data: post });
});




exports.getParticipatedExams = asyncHandler(async (req, res, next) => {
  if (req.user.role !== "student") {
    return next(new ErrorResponse("Chỉ học sinh có thể xem đề thi đã tham gia", 403));
  }
  const scores = await ExamResult.find({ userId: req.user.id }).populate("examId");
  const participatedExams = scores
    .filter((score) => ExamResult.examId) // Kiểm tra ExamResult.examId tồn tại
    .map((score) => ({
      _id: ExamResult.examId._id,
      title: ExamResult.examId.title,
      subject: ExamResult.examId.subject || "Không xác định",
      score: ExamResult.score,
      startTime: ExamResult.examId.startTime,
      endTime: ExamResult.examId.endTime,
    }));
  res.status(200).json({ success: true, data: participatedExams || [] });
});

exports.getAchievements = asyncHandler(async (req, res, next) => {
  const scores = await ExamResult.find({ userId: req.user.id });
  const totalExams = scores.length;
  const perfectScores = scores.filter((s) => s.score === 100).length;

  const achievements = [];
  if (totalExams >= 10) {
    achievements.push({ name: "Hoàn thành 10 bài thi", badge: "exam-master" });
  }
  if (perfectScores >= 1) {
    achievements.push({ name: "Đạt điểm 100", badge: "perfect-score" });
  }

  res.status(200).json({ success: true, data: achievements || [] });
});