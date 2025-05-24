const express = require("express");
const router = express.Router();
const {
  createStudyRoom,
  getStudyRooms,
  getStudyRoomById,
  joinStudyRoom,
  leaveStudyRoom,
  sendMessage,
  closeStudyRoom,
  getMyStudyRooms,
} = require("../controllers/studyRoomController");
const { authenticateToken } = require("../middleware/authMiddleware");

// Tất cả các routes đều yêu cầu xác thực
router.use(authenticateToken);

router.route("/").get(getStudyRooms).post(createStudyRoom);

router.get("/my-rooms", getMyStudyRooms);

router.route("/:id").get(getStudyRoomById);

router.post("/:id/join", joinStudyRoom);
router.post("/:id/leave", leaveStudyRoom);
router.post("/:id/messages", sendMessage);
router.post("/:id/close", closeStudyRoom);

module.exports = router;
