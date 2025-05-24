const Comment = require("../models/Comment");
const Document = require("../models/Document");
const Notification = require("../models/Notification");
const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");

exports.getCommentsByDocument = asyncHandler(async (req, res, next) => {
  const { referenceId } = req.params;
  const { type, page = 1, limit = 5 } = req.query;

  if (!["post", "article", "document"].includes(type)) {
    return next(
      new ErrorResponse(
        "Loại tham chiếu không hợp lệ. Phải là 'post', 'article' hoặc 'document'.",
        400
      )
    );
  }

  const skip = (page - 1) * limit;

  const rootComments = await Comment.find({
    referenceType: type,
    referenceId: referenceId,
    parentComment: null,
  })
    .sort({ createdAt: -1 })
    .skip(parseInt(skip))
    .limit(parseInt(limit))
    .populate("author", "username fullName");

  const total = await Comment.countDocuments({
    referenceType: type,
    referenceId: referenceId,
    parentComment: null,
  });

  const rootIds = rootComments.map((c) => c._id);
  const replies = await Comment.find({
    parentComment: { $in: rootIds },
  }).populate("author", "username");

  res.status(200).json({
    success: true,
    comments: rootComments,
    replies,
    currentPage: parseInt(page),
    totalPages: Math.ceil(total / limit),
  });
});

exports.getCommentsByPost = asyncHandler(async (req, res, next) => {
  const { postId } = req.params;
  const { page = 1, limit = 5 } = req.query;

  const skip = (page - 1) * limit;

  const rootComments = await Comment.find({
    referenceType: "post",
    referenceId: postId,
    parentComment: null,
  })
    .sort({ createdAt: -1 })
    .skip(parseInt(skip))
    .limit(parseInt(limit))
    .populate("author", "username fullName");

  const total = await Comment.countDocuments({
    referenceType: "post",
    referenceId: postId,
    parentComment: null,
  });

  const rootIds = rootComments.map((c) => c._id);
  const replies = await Comment.find({
    parentComment: { $in: rootIds },
  }).populate("author", "username");

  res.status(200).json({
    success: true,
    comments: rootComments,
    replies,
    currentPage: parseInt(page),
    totalPages: Math.ceil(total / limit),
  });
});

exports.createComment = asyncHandler(async (req, res, next) => {
  const { referenceId, referenceType, content } = req.body;

  if (!content) {
    return next(
      new ErrorResponse("Nội dung bình luận không được để trống", 400)
    );
  }

  if (!["post", "article", "document"].includes(referenceType)) {
    return next(
      new ErrorResponse(
        "Loại tham chiếu không hợp lệ. Phải là 'post', 'article' hoặc 'document'.",
        400
      )
    );
  }

  const newComment = new Comment({
    referenceType,
    referenceId,
    author: req.user.id,
    content,
  });

  await newComment.save();
  const populatedComment = await newComment.populate(
    "author",
    "username fullName"
  );

  res.status(201).json({
    success: true,
    message: "Gửi bình luận thành công!",
    comment: populatedComment,
  });
});

exports.updateComment = asyncHandler(async (req, res, next) => {
  const { content } = req.body;
  const comment = await Comment.findById(req.params.id);

  if (!comment) {
    return next(new ErrorResponse("Không tìm thấy bình luận", 404));
  }

  if (comment.author.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new ErrorResponse("Bạn không có quyền sửa bình luận này", 403));
  }

  comment.content = content || comment.content;
  await comment.save();

  res.status(200).json({ success: true, message: "Đã sửa bình luận", comment });
});

exports.deleteComment = asyncHandler(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id);

  if (!comment) {
    return next(new ErrorResponse("Không tìm thấy bình luận", 404));
  }

  if (comment.author.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new ErrorResponse("Bạn không có quyền xóa bình luận này", 403));
  }

  await Comment.findByIdAndDelete(req.params.id);

  res.status(200).json({ success: true, message: "Đã xóa bình luận" });
});

exports.likeComment = asyncHandler(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    return next(new ErrorResponse("Không tìm thấy bình luận", 404));
  }

  const userId = req.user._id;
  const isLiked = comment.likes.includes(userId);

  if (isLiked) {
    comment.likes = comment.likes.filter((id) => id.toString() !== userId.toString());
  } else {
    comment.likes.push(userId);
  }

  await comment.save();

  res.status(200).json({
    success: true,
    likes: comment.likes,
    isLiked: !isLiked,
  });
});

exports.replyToComment = asyncHandler(async (req, res, next) => {
  const { content } = req.body;
  if (!content) {
    return next(new ErrorResponse("Nội dung trả lời không được để trống", 400));
  }

  const parentComment = await Comment.findById(req.params.id);
  if (!parentComment) {
    return next(new ErrorResponse("Không tìm thấy bình luận gốc", 404));
  }

  const newReply = new Comment({
    referenceType: parentComment.referenceType,
    referenceId: parentComment.referenceId,
    author: req.user.id,
    content,
    parentComment: parentComment._id,
  });

  await newReply.save();
  const populatedReply = await newReply.populate("author", "username fullName");

  res.status(201).json({
    success: true,
    message: "Đã trả lời bình luận",
    reply: populatedReply,
  });
});

exports.reportComment = asyncHandler(async (req, res, next) => {
  const { reason } = req.body;
  if (!reason) {
    return next(new ErrorResponse("Lý do báo cáo không được để trống", 400));
  }

  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    return next(new ErrorResponse("Không tìm thấy bình luận", 404));
  }

  // Logic lưu báo cáo (giả định thêm trường report vào model Comment)
  comment.reports = comment.reports || [];
  comment.reports.push({ userId: req.user.id, reason, reportedAt: new Date() });
  await comment.save();

  res.status(200).json({
    success: true,
    message: "Đã báo cáo bình luận",
  });
});

exports.getFeaturedComments = asyncHandler(async (req, res, next) => {
  const { postId } = req.params;
  const { limit = 3 } = req.query;

  const featuredComments = await Comment.find({
    referenceType: "post",
    referenceId: postId,
    parentComment: null,
  })
    .sort({ likes: -1, createdAt: -1 })
    .limit(parseInt(limit))
    .populate("author", "username fullName");

  res.status(200).json({
    success: true,
    comments: featuredComments,
  });
});