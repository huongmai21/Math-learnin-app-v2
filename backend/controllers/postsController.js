const Post = require("../models/Post");
const Comment = require("../models/Comment");
const User = require("../models/User");
const Notification = require("../models/Notification");
const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const cloudinary = require("../config/cloudinary");

// Lấy tất cả bài đăng (có phân trang và lọc)
exports.getPosts = asyncHandler(async (req, res, next) => {
  const {
    page = 1,
    limit = 10,
    category,
    subject,
    status,
    tag,
    search,
    userId,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const query = {};

  if (category) query.category = category;
  if (subject) query.subject = subject;
  if (status) query.status = status;
  if (tag) query.tags = { $in: [tag] };
  if (userId) query.userId = userId;

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { content: { $regex: search, $options: "i" } },
      { tags: { $regex: search, $options: "i" } },
    ];
  }

  const sort = {};
  sort[sortBy] = sortOrder === "desc" ? -1 : 1;

  const posts = await Post.find(query)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .populate("userId", "username avatar");

  const total = await Post.countDocuments(query);

  res.status(200).json({
    success: true,
    data: posts,
    totalPages: Math.ceil(total / limit),
    currentPage: Number(page),
  });
});

// Lấy bài đăng theo ID
exports.getPostById = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id).populate("userId", "username avatar");

  if (!post) {
    return next(new ErrorResponse("Không tìm thấy bài đăng", 404));
  }

  // Tăng lượt xem
  post.views += 1;
  await post.save();

  res.status(200).json({
    success: true,
    data: post,
  });
});

// Tạo bài đăng mới
exports.createPost = asyncHandler(async (req, res, next) => {
  const { title, content, tags, category, subject, status, images, files } = req.body;

  const post = await Post.create({
    userId: req.user.id,
    title,
    content,
    tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
    category,
    subject,
    status,
    images,
    files,
  });

  // Thông báo cho người theo dõi
  const followers = await User.find({ following: req.user.id });
  if (followers.length > 0) {
    const notifications = followers.map((follower) => ({
      recipient: follower._id,
      sender: req.user.id,
      type: "post",
      title: "Bài đăng mới",
      message: `${req.user.username} đã đăng một bài viết mới: "${title}"`,
      link: `/posts/${post._id}`,
      relatedModel: "Post",
      relatedId: post._id,
    }));

    await Notification.insertMany(notifications);
  }

  res.status(201).json({
    success: true,
    data: post,
  });
});

// Cập nhật bài đăng
exports.updatePost = asyncHandler(async (req, res, next) => {
  let post = await Post.findById(req.params.id);

  if (!post) {
    return next(new ErrorResponse("Không tìm thấy bài đăng", 404));
  }

  // Kiểm tra quyền sở hữu
  if (post.userId.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new ErrorResponse("Không có quyền cập nhật bài đăng này", 403));
  }

  const { title, content, tags, category, subject, status, images, files } = req.body;

  post = await Post.findByIdAndUpdate(
    req.params.id,
    {
      title,
      content,
      tags: tags ? tags.split(",").map((tag) => tag.trim()) : post.tags,
      category: category || post.category,
      subject: subject || post.subject,
      status: status || post.status,
      images: images || post.images,
      files: files || post.files,
    },
    { new: true, runValidators: true },
  );

  res.status(200).json({
    success: true,
    data: post,
  });
});

// Xóa bài đăng
exports.deletePost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(new ErrorResponse("Không tìm thấy bài đăng", 404));
  }

  // Kiểm tra quyền sở hữu
  if (post.userId.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new ErrorResponse("Không có quyền xóa bài đăng này", 403));
  }

  // Xóa tất cả bình luận liên quan
  await Comment.deleteMany({ postId: post._id });

  // Xóa thông báo liên quan
  await Notification.deleteMany({ relatedModel: "Post", relatedId: post._id });

  await post.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});

// Thích bài đăng
exports.likePost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(new ErrorResponse("Không tìm thấy bài đăng", 404));
  }

  // Kiểm tra xem người dùng đã thích bài đăng chưa
  const isLiked = post.likes.includes(req.user.id);

  if (isLiked) {
    // Bỏ thích
    post.likes = post.likes.filter((like) => like.toString() !== req.user.id);
  } else {
    // Thích
    post.likes.push(req.user.id);

    // Thông báo cho người đăng
    if (post.userId.toString() !== req.user.id) {
      await Notification.create({
        recipient: post.userId,
        sender: req.user.id,
        type: "like",
        title: "Lượt thích mới",
        message: `${req.user.username} đã thích bài đăng của bạn`,
        link: `/posts/${post._id}`,
        relatedModel: "Post",
        relatedId: post._id,
      });
    }
  }

  await post.save();

  res.status(200).json({
    success: true,
    data: { likes: post.likes, isLiked: !isLiked },
  });
});

// Lấy bài đăng phổ biến
exports.getPopularPosts = asyncHandler(async (req, res, next) => {
  const { limit = 5, category, subject } = req.query;

  const query = {};
  if (category) query.category = category;
  if (subject) query.subject = subject;

  const posts = await Post.find(query)
    .sort({ views: -1, likes: -1 })
    .limit(Number(limit))
    .populate("userId", "username avatar");

  res.status(200).json({
    success: true,
    data: posts,
  });
});

// Tìm kiếm bài đăng
exports.searchPosts = asyncHandler(async (req, res, next) => {
  const { q, page = 1, limit = 10 } = req.query;

  if (!q) {
    return next(new ErrorResponse("Vui lòng nhập từ khóa tìm kiếm", 400));
  }

  const query = {
    $or: [
      { title: { $regex: q, $options: "i" } },
      { content: { $regex: q, $options: "i" } },
      { tags: { $regex: q, $options: "i" } },
    ],
  };

  const posts = await Post.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .populate("userId", "username avatar");

  const total = await Post.countDocuments(query);

  res.status(200).json({
    success: true,
    data: posts,
    totalPages: Math.ceil(total / limit),
    currentPage: Number(page),
  });
});

// Cập nhật trạng thái bài đăng
exports.updatePostStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(new ErrorResponse("Không tìm thấy bài đăng", 404));
  }

  // Kiểm tra quyền sở hữu
  if (post.userId.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new ErrorResponse("Không có quyền cập nhật trạng thái bài đăng này", 403));
  }

  post.status = status;
  await post.save();

  res.status(200).json({
    success: true,
    data: post,
  });
});

// Cập nhật câu trả lời AI cho bài đăng
exports.updateAiResponse = asyncHandler(async (req, res, next) => {
  const { aiResponse } = req.body;
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(new ErrorResponse("Không tìm thấy bài đăng", 404));
  }

  post.aiResponse = aiResponse;
  post.isAiAnswered = true;
  await post.save();

  res.status(200).json({
    success: true,
    data: post,
  });
});

// Upload ảnh cho bài đăng
exports.uploadPostImage = asyncHandler(async (req, res, next) => {
  if (!req.files || !req.files.image) {
    return next(new ErrorResponse("Vui lòng tải lên một hình ảnh", 400));
  }

  const file = req.files.image;

  // Kiểm tra kích thước file
  if (file.size > 10 * 1024 * 1024) {
    return next(new ErrorResponse("Kích thước file không được vượt quá 10MB", 400));
  }

  // Kiểm tra loại file
  if (!file.mimetype.startsWith("image")) {
    return next(new ErrorResponse("Vui lòng tải lên một hình ảnh", 400));
  }

  try {
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: "posts",
      resource_type: "image",
    });

    res.status(200).json({
      success: true,
      data: { url: result.secure_url },
    });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return next(new ErrorResponse("Lỗi khi tải lên hình ảnh", 500));
  }
});

// Upload file cho bài đăng
exports.uploadPostFile = asyncHandler(async (req, res, next) => {
  if (!req.files || !req.files.file) {
    return next(new ErrorResponse("Vui lòng tải lên một file", 400));
  }

  const file = req.files.file;

  // Kiểm tra kích thước file
  if (file.size > 20 * 1024 * 1024) {
    return next(new ErrorResponse("Kích thước file không được vượt quá 20MB", 400));
  }

  try {
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: "files",
      resource_type: "auto",
    });

    res.status(200).json({
      success: true,
      data: {
        name: file.name,
        url: result.secure_url,
        type: file.mimetype,
      },
    });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return next(new ErrorResponse("Lỗi khi tải lên file", 500));
  }
});