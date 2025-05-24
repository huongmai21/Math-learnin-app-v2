const express = require("express");
const router = express.Router();
const {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  likePost,
  getPopularPosts,
  searchPosts,
  updatePostStatus,
  updateAiResponse,
  uploadPostImage,
  uploadPostFile,
} = require("../controllers/postsController");
const { authenticateToken } = require("../middleware/authMiddleware");

// Các route không yêu cầu xác thực
router.get("/", getPosts);
router.get("/popular", getPopularPosts);
router.get("/search", searchPosts);
router.get("/:id", getPostById);

// Các route yêu cầu xác thực
router.use(authenticateToken);

router.post("/", createPost);
router.put("/:id", updatePost);
router.delete("/:id", deletePost);
router.post("/:id/like", likePost);
router.put("/:id/status", updatePostStatus);
router.put("/:id/ai-response", updateAiResponse);
router.post("/upload/image", uploadPostImage);
router.post("/upload/file", uploadPostFile);

module.exports = router;