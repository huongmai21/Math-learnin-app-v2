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
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

router.get("/", getPosts);
router.get("/popular", getPopularPosts);
router.get("/search", searchPosts);
router.get("/:id", getPostById);

router.use(authenticateToken);

router.post("/", createPost);
router.put("/:id", updatePost);
router.delete("/:id", deletePost);
router.post("/:id/like", likePost);
router.put("/:id/status", updatePostStatus);
router.put("/:id/ai-response", updateAiResponse);
router.post("/upload/image", upload.single("image"), uploadPostImage);
router.post("/upload/file", upload.single("file"), uploadPostFile);

module.exports = router;