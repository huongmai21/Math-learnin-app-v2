const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");
const { authenticateToken } = require("../middleware/authMiddleware");

// Lấy bình luận theo post
router.get("/post/:postId", commentController.getCommentsByPost);

// Lấy bình luận theo document (cũ)
router.get("/document/:referenceId", commentController.getCommentsByDocument);

// Các route yêu cầu xác thực
router.post("/", authenticateToken, commentController.createComment);
router.put("/:id", authenticateToken, commentController.updateComment);
router.delete("/:id", authenticateToken, commentController.deleteComment);
router.post("/:id/like", authenticateToken, commentController.likeComment);
router.post("/:id/reply", authenticateToken, commentController.replyToComment);
router.post("/:id/report", authenticateToken, commentController.reportComment);

// Lấy bình luận nổi bật
router.get("/post/:postId/featured", commentController.getFeaturedComments);

module.exports = router;