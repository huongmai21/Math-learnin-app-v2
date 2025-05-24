const express = require("express");
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  getUnreadCount,
} = require("../controllers/notificationController");
const { authenticateToken } = require("../middleware/authMiddleware");

// Tất cả các route đều cần xác thực
router.use(authenticateToken);

router.route("/").get(getNotifications).delete(deleteAllNotifications);

router.get("/unread", getUnreadCount);
router.put("/read-all", markAllAsRead);

router.route("/:id").put(markAsRead).delete(deleteNotification);

module.exports = router;

