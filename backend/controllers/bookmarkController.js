const Bookmark = require("../models/Bookmark");
const Post = require("../models/Post");
const Document = require("../models/Document");
const News = require("../models/News");
const Course = require("../models/Course");
const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");

exports.addBookmark = asyncHandler(async (req, res, next) => {
  const { referenceType, referenceId } = req.body;

  if (!["post", "document", "news", "course"].includes(referenceType)) {
    return next(new ErrorResponse("Loại tài nguyên không hợp lệ", 400));
  }

  let resource;
  if (referenceType === "post") {
    resource = await Post.findById(referenceId);
  } else if (referenceType === "document") {
    resource = await Document.findById(referenceId);
  } else if (referenceType === "news") {
    resource = await News.findById(referenceId);
  } else if (referenceType === "course") {
    resource = await Course.findById(referenceId);
  }

  if (!resource) {
    return next(new ErrorResponse("Tài nguyên không tồn tại", 404));
  }

  const existingBookmark = await Bookmark.findOne({
    user: req.user.id,
    referenceType,
    referenceId,
  });

  if (existingBookmark) {
    return next(new ErrorResponse("Tài nguyên đã được đánh dấu", 400));
  }

  const bookmark = await Bookmark.create({
    user: req.user.id,
    referenceType,
    referenceId,
  });

  // Emit WebSocket event
  global.io.to(req.user.id).emit("bookmark_notification", {
    message: `Bạn đã đánh dấu ${referenceType} ${referenceId}`,
    referenceType,
    referenceId,
    action: "add",
  });

  res.status(201).json({
    success: true,
    data: bookmark,
  });
});

exports.removeBookmark = asyncHandler(async (req, res, next) => {
  const { referenceType, referenceId } = req.params;

  if (!["post", "document", "news", "course"].includes(referenceType)) {
    return next(new ErrorResponse("Loại tài nguyên không hợp lệ", 400));
  }

  const bookmark = await Bookmark.findOneAndDelete({
    user: req.user.id,
    referenceType,
    referenceId,
  });

  if (!bookmark) {
    return next(new ErrorResponse("Bookmark không tồn tại", 404));
  }

  // Emit WebSocket event
  global.io.to(req.user.id).emit("bookmark_notification", {
    message: `Bạn đã bỏ đánh dấu ${referenceType} ${referenceId}`,
    referenceType,
    referenceId,
    action: "remove",
  });

  res.status(200).json({
    success: true,
    message: "Đã xóa bookmark",
  });
});

exports.getBookmarks = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, referenceType, search } = req.query;

  const query = { user: req.user.id };
  if (referenceType) {
    query.referenceType = referenceType;
  }

  const bookmarks = await Bookmark.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .populate({
      path: "referenceId",
      populate: {
        path: referenceType === "post" || referenceType === "news" ? "author userId" : "uploadedBy",
        select: "username avatar",
      },
    });

  const total = await Bookmark.countDocuments(query);

  // Lọc và áp dụng tìm kiếm trên dữ liệu đã populate
  let filteredBookmarks = bookmarks;
  if (search) {
    filteredBookmarks = bookmarks.filter((bookmark) => {
      const resource = bookmark.referenceId;
      if (!resource) return false;
      const searchableFields = [
        resource.title || "",
        resource.content || "",
        resource.description || "",
        resource.summary || "",
      ];
      return searchableFields.some((field) =>
        field.toLowerCase().includes(search.toLowerCase())
      );
    });
  }

  res.status(200).json({
    success: true,
    data: filteredBookmarks,
    totalPages: Math.ceil(total / limit),
    currentPage: Number(page),
  });
});

exports.checkBookmarks = asyncHandler(async (req, res, next) => {
  const { referenceType, referenceIds } = req.body;

  if (!["post", "document", "news", "course"].includes(referenceType)) {
    return next(new ErrorResponse("Loại tài nguyên không hợp lệ", 400));
  }

  if (!Array.isArray(referenceIds) || referenceIds.length === 0) {
    return next(new ErrorResponse("Danh sách ID không hợp lệ", 400));
  }

  const bookmarks = await Bookmark.find({
    user: req.user.id,
    referenceType,
    referenceId: { $in: referenceIds },
  });

  const bookmarkedIds = bookmarks.map((bookmark) => bookmark.referenceId.toString());

  res.status(200).json({
    success: true,
    data: bookmarkedIds,
  });
});