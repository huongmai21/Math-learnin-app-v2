const Notification = require("../models/Notification")
const asyncHandler = require("../middleware/asyncHandler")
const ErrorResponse = require("../utils/errorResponse")

// Lấy tất cả thông báo của người dùng
exports.getNotifications = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, unread } = req.query

  const query = { recipient: req.user._id }

  if (unread === "true") {
    query.read = false
  }

  const total = await Notification.countDocuments(query)

  const notifications = await Notification.find(query)
    .populate("sender", "username avatar")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number.parseInt(limit))

  res.status(200).json({
    success: true,
    count: notifications.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    unreadCount: await Notification.countDocuments({ recipient: req.user._id, read: false }),
    data: notifications,
  })
})

// Đánh dấu thông báo đã đọc
exports.markAsRead = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id)

  if (!notification) {
    return next(new ErrorResponse("Thông báo không tồn tại", 404))
  }

  // Kiểm tra quyền
  if (notification.recipient.toString() !== req.user._id.toString()) {
    return next(new ErrorResponse("Bạn không có quyền truy cập thông báo n��y", 403))
  }

  notification.read = true
  await notification.save()

  res.status(200).json({ success: true, data: notification })
})

// Đánh dấu tất cả thông báo đã đọc
exports.markAllAsRead = asyncHandler(async (req, res, next) => {
  await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true })

  res.status(200).json({ success: true, message: "Tất cả thông báo đã được đánh dấu là đã đọc" })
})

// Xóa thông báo
exports.deleteNotification = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id)

  if (!notification) {
    return next(new ErrorResponse("Thông báo không tồn tại", 404))
  }

  // Kiểm tra quyền
  if (notification.recipient.toString() !== req.user._id.toString()) {
    return next(new ErrorResponse("Bạn không có quyền xóa thông báo này", 403))
  }

  await notification.remove()

  res.status(200).json({ success: true, data: {} })
})

// Xóa tất cả thông báo
exports.deleteAllNotifications = asyncHandler(async (req, res, next) => {
  await Notification.deleteMany({ recipient: req.user._id })

  res.status(200).json({ success: true, message: "Tất cả thông báo đã được xóa" })
})

// Lấy số lượng thông báo chưa đọc
exports.getUnreadCount = asyncHandler(async (req, res, next) => {
  const count = await Notification.countDocuments({
    recipient: req.user._id,
    read: false,
  })

  res.status(200).json({ success: true, count })
})
