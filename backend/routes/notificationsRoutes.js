const express = require("express");
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  getUnreadCount,
  createSystemNotification,
} = require("../controllers/notificationController");
const { authenticateToken, checkRole } = require("../middleware/authMiddleware");

// Tất cả các route đều cần xác thực
router.use(authenticateToken);

router.route("/").get(getNotifications).delete(deleteAllNotifications);

router.get("/unread", getUnreadCount);
router.put("/read-all", markAllAsRead);

router.route("/:id").put(markAsRead).delete(deleteNotification);
router.post("/system", authenticateToken, checkRole("admin"), createSystemNotification);

module.exports = router;

