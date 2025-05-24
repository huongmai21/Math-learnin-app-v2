// backend/routes/profileRoutes.js
const express = require("express");
const router = express.Router();
const {
  getScores,
  getBookmarks,
  getPosts,
  getCourses,
  addBookmark,
  createPost,
  enrollCourse,
  createCourse,
  getParticipatedExams,
  getAchievements,
} = require("../controllers/profileController");
const { authenticateToken, checkRole } = require("../middleware/authMiddleware");

router.get("/scores", authenticateToken, getScores);
router.get("/library", authenticateToken, getBookmarks);
router.get("/posts", authenticateToken, getPosts);
router.get("/courses", authenticateToken, getCourses);
router.get("/participated-exams", authenticateToken, getParticipatedExams); // Thêm route
router.post("/library", authenticateToken, addBookmark);
router.post("/posts", authenticateToken, createPost);
router.post("/courses/enroll", authenticateToken, enrollCourse);
router.post("/courses", authenticateToken, createCourse);
router.get("/achievements", authenticateToken, getAchievements);

module.exports = router;