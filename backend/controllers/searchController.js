// backend/controllers/searchController.js
const asyncHandler = require("../middleware/asyncHandler");
const Course = require("../models/Course");
const News = require("../models/News");

exports.searchResources = asyncHandler(async (req, res, next) => {
  const { q } = req.query;
  if (!q) {
    return res
      .status(400)
      .json({ success: false, message: "Vui lòng cung cấp từ khóa tìm kiếm" });
  }

  const courses = await Course.find({
    $or: [
      { title: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
    ],
  }).populate("instructorId", "username");

  const news = await News.find({
    $or: [
      { title: { $regex: q, $options: "i" } },
      { content: { $regex: q, $options: "i" } },
      { summary: { $regex: q, $options: "i" } },
    ],
  }).populate("author", "username");

  res.status(200).json({
    success: true,
    data: {
      courses,
      news,
    },
  });
});
