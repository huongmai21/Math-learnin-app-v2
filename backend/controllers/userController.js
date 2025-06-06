const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const cloudinary = require("../config/cloudinary");
const {User, UserActivity, Follow, Notification} = require("../models");

exports.getProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id)
    .populate("enrolledCourses completedCourses")
    .select("-password");
  if (!user) {
    return next(new ErrorResponse("Người dùng không tồn tại", 404));
  }
  res.status(200).json({ success: true, data: user });
});

exports.getUserActivity = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const year = parseInt(req.query.year) || new Date().getFullYear();

  if (isNaN(year) || year < 2000 || year > new Date().getFullYear()) {
    return next(new ErrorResponse("Năm không hợp lệ", 400));
  }

  const activities = await UserActivity.find({
    userId,
    date: { $regex: `^${year}` },
  });

  const startDate = new Date(`${year}-01-01`);
  const endDate = new Date(`${year}-12-31`);
  const fullActivity = [];
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split("T")[0];
    const act = activities.find((a) => a.date === dateStr) || {
      date: dateStr,
      count: 0,
      description: [],
    };
    fullActivity.push({
      date: act.date,
      count: act.count || 0,
      description: act.description || [],
    });
  }

  res.status(200).json({
    success: true,
    data: {
      activity: fullActivity,
      total: activities.reduce((sum, act) => sum + (act.count || 0), 0),
    },
  });
});

exports.updateProfile = asyncHandler(async (req, res, next) => {
  const { username, email, bio, avatar } = req.body;
  const user = await User.findById(req.user.id);

  if (!user) return next(new ErrorResponse("Người dùng không tồn tại", 404));

  let avatarUrl = user.avatar;
  if (req.file) {
    try {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "avatar",
        transformation: [
          { width: 100, height: 100, crop: "fill", quality: "auto" },
        ],
      });
      avatarUrl = result.secure_url;
    } catch (error) {
      return next(new ErrorResponse("Upload ảnh thất bại", 500));
    }
  }

  user.username = username || user.username;
  user.email = email || user.email;
  user.avatar = avatarUrl;
  user.bio = bio || user.bio;

  await user.save();
  res.status(200).json({ success: true, data: user });
});

exports.changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  if (!currentPassword || !newPassword || !confirmPassword) {
    return next(new ErrorResponse("Thiếu thông tin cần thiết", 400));
  }

  const user = await User.findById(req.user.id).select("+password");

  if (!user) {
    return next(new ErrorResponse("Người dùng không tồn tại", 404));
  }

  // Kiểm tra mật khẩu hiện tại
  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    return next(new ErrorResponse("Mật khẩu hiện tại không đúng", 400));
  }

  // Kiểm tra mật khẩu mới và xác nhận
  if (newPassword !== confirmPassword) {
    return next(new ErrorResponse("Mật khẩu mới và xác nhận không khớp", 400));
  }

  // Cập nhật mật khẩu
  user.password = newPassword;
  await user.save();

  res.status(200).json({ success: true, message: "Đổi mật khẩu thành công" });
});

exports.followUser = asyncHandler(async (req, res, next) => {
  const userToFollow = await User.findById(req.params.id);
  const currentUser = await User.findById(req.user.id);
  if (!userToFollow || !currentUser) {
    return next(new ErrorResponse("Người dùng không tồn tại", 404));
  }

  if (userToFollow._id.equals(currentUser._id)) {
    return next(new ErrorResponse("Không thể tự theo dõi chính mình", 400));
  }

  const existingFollow = await Follow.findOne({
    followerId: currentUser._id,
    followingId: userToFollow._id,
  });
  if (existingFollow) {
    return next(new ErrorResponse("Bạn đã theo dõi người dùng này", 400));
  }

  await Follow.create({
    followerId: currentUser._id,
    followingId: userToFollow._id,
  });

  const io = req.app.get("io");
  if (io) {
    const notification = await Notification.create({
      recipient: userToFollow._id,
      sender: currentUser._id,
      type: "system",
      title: "Người theo dõi mới",
      message: `${currentUser.username} đã theo dõi bạn.`,
      link: `/users/profile/${currentUser._id}`,
      relatedModel: "User",
      relatedId: currentUser._id,
    });
    io.to(userToFollow._id.toString()).emit("newNotification", {
      _id: notification._id,
      title: notification.title,
      message: notification.message,
      link: notification.link,
      createdAt: notification.createdAt,
    });
  }

  res.status(200).json({ success: true, message: "Theo dõi thành công" });
});

exports.unfollowUser = asyncHandler(async (req, res, next) => {
  const userToUnfollow = await User.findById(req.params.id);
  const currentUser = await User.findById(req.user.id);
  if (!userToUnfollow || !currentUser) {
    return next(new ErrorResponse("Người dùng không tồn tại", 404));
  }

  const result = await Follow.deleteOne({
    followerId: currentUser._id,
    followingId: userToUnfollow._id,
  });

  if (result.deletedCount === 0) {
    return next(new ErrorResponse("Bạn chưa theo dõi người dùng này", 400));
  }

  res.status(200).json({ success: true, message: "Hủy theo dõi thành công" });
});

exports.getFollowers = asyncHandler(async (req, res, next) => {
  const followers = await Follow.find({ followingId: req.user.id }).populate(
    "followerId",
    "username avatar bio"
  );
  res.status(200).json({
    success: true,
    data: followers.map((f) => f.followerId) || [],
  });
});

exports.getFollowing = asyncHandler(async (req, res, next) => {
  const following = await Follow.find({ followerId: req.user.id }).populate(
    "followingId",
    "username avatar bio"
  );
  res.status(200).json({
    success: true,
    data: following.map((f) => f.followingId) || [],
  });
});

exports.getUserSuggestions = asyncHandler(async (req, res, next) => {
  const following = await Follow.find({ followerId: req.user.id }).select(
    "followingId"
  );
  const followingIds = following.map((f) => f.followingId);
  const users = await User.find({
    _id: { $nin: [req.user.id, ...followingIds] },
  })
    .select("username avatar bio")
    .limit(5);
  res.status(200).json({ success: true, data: users || [] });
});

exports.getRecentActivities = asyncHandler(async (req, res, next) => {
  const { limit = 5 } = req.query;
  const activities = await UserActivity.find({ userId: req.user.id })
    .sort({ date: -1 })
    .limit(parseInt(limit))
    .populate("userId", "username");

  res.status(200).json({ success: true, data: activities || [] });
});
