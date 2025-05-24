const Notification = require("../models/Notification");
const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");

const retryOperation = async (operation, retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

// Gửi thông báo qua Socket.IO
const sendNotification = async (recipientId, notificationData) => {
  try {
    if (recipientId) {
      await global.io.to(recipientId.toString()).emit("newNotifications", notificationData);
    } else {
      // Thông báo toàn cục
      await global.io.emit("global_notification", notificationData);
    }
  } catch (error) {
    console.error("Error sending notification via Socket.IO:", error);
  }
};

// Tạo thông báo mới
exports.createNotification = asyncHandler(async (req, res, next) => {
  try {
    const notification = await retryOperation(async () => {
      return await Notification.create({
        ...req.body,
        recipient: req.body.recipientId || null,
        sender: req.user._id,
      });
    });

    await sendNotification(req.body.recipientId, notification);
    res.status(201).json({ success: true, data: notification });
  } catch (error) {
    return next(new ErrorResponse("Không thể tạo thông báo", 500));
  }
});

// Lấy tất cả thông báo của người dùng
exports.getNotifications = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, unread } = req.query;

  const query = { recipient: req.user._id };
  if (unread === "true") {
    query.read = false;
  }

  const safeLimit = Math.min(Number.parseInt(limit) || 10, 50);
  const safePage = Number.parseInt(page) || 1;

  try {
    const total = await retryOperation(async () => {
      return await Notification.countDocuments(query);
    });

    const notifications = await retryOperation(async () => {
      return await Notification.find(query)
        .populate("sender", "username avatar")
        .sort({ createdAt: -1 })
        .skip((safePage - 1) * safeLimit)
        .limit(safeLimit)
        .lean();
    });

    const unreadCount = await retryOperation(async () => {
      return await Notification.countDocuments({
        recipient: req.user._id,
        read: false,
      });
    });

    res.status(200).json({
      success: true,
      count: notifications.length,
      total,
      totalPages: Math.ceil(total / safeLimit),
      currentPage: safePage,
      unreadCount,
      data: notifications,
    });
  } catch (error) {
    return next(new ErrorResponse("Không thể lấy thông báo", 500));
  }
});

// Đánh dấu thông báo đã đọc
exports.markAsRead = asyncHandler(async (req, res, next) => {
  try {
    const notification = await retryOperation(async () => {
      const notif = await Notification.findById(req.params.id);
      if (!notif) {
        throw new ErrorResponse("Thông báo không tồn tại", 404);
      }
      if (notif.recipient.toString() !== req.user._id.toString()) {
        throw new ErrorResponse("Bạn không có quyền truy cập thông báo này", 403);
      }
      notif.read = true;
      return await notif.save();
    });

    await sendNotification(req.user._id, notification);
    global.io.to(req.user._id.toString()).emit("ackNotifications"); // Thêm sự kiện ack
    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    return next(error);
  }
});

// Đánh dấu tất cả thông báo đã đọc
exports.markAllAsRead = asyncHandler(async (req, res, next) => {
  try {
    await retryOperation(async () => {
      return await Notification.updateMany(
        { recipient: req.user._id, read: false },
        { read: true }
      );
    });

    await sendNotification(req.user._id, { message: "Tất cả thông báo đã được đánh dấu là đã đọc" });
    global.io.to(req.user._id.toString()).emit("ackNotifications"); // Thêm sự kiện ack
    res.status(200).json({ success: true, message: "Tất cả thông báo đã được đánh dấu là đã đọc" });
  } catch (error) {
    return next(new ErrorResponse("Không thể đánh dấu tất cả thông báo", 500));
  }
});

// Xóa thông báo
exports.deleteNotification = asyncHandler(async (req, res, next) => {
  try {
    const notification = await retryOperation(async () => {
      const notif = await Notification.findById(req.params.id);
      if (!notif) {
        throw new ErrorResponse("Thông báo không tồn tại", 404);
      }
      if (notif.recipient.toString() !== req.user._id.toString()) {
        throw new ErrorResponse("Bạn không có quyền xóa thông báo này", 403);
      }
      await notif.remove();
      return notif;
    });

    await sendNotification(req.user._id, { message: "Thông báo đã được xóa" });
    global.io.to(req.user._id.toString()).emit("ackNotifications"); // Thêm sự kiện ack
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    return next(error);
  }
});

// Xóa tất cả thông báo
exports.deleteAllNotifications = asyncHandler(async (req, res, next) => {
  try {
    await retryOperation(async () => {
      return await Notification.deleteMany({ recipient: req.user._id });
    });

    await sendNotification(req.user._id, { message: "Tất cả thông báo đã được xóa" });
    global.io.to(req.user._id.toString()).emit("ackNotifications"); // Thêm sự kiện ack
    res.status(200).json({ success: true, message: "Tất cả thông báo đã được xóa" });
  } catch (error) {
    return next(new ErrorResponse("Không thể xóa tất cả thông báo", 500));
  }
});

// Lấy số lượng thông báo chưa đọc
exports.getUnreadCount = asyncHandler(async (req, res, next) => {
  try {
    const count = await retryOperation(async () => {
      return await Notification.countDocuments({
        recipient: req.user._id,
        read: false,
      });
    });

    res.status(200).json({ success: true, count });
  } catch (error) {
    return next(new ErrorResponse("Không thể lấy số lượng thông báo chưa đọc", 500));
  }
});