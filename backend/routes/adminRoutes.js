// adminRoutes.js
const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { authenticateToken, checkRole } = require("../middleware/authMiddleware");
const upload = require("../middleware/multer");

// Routes quản lý người dùng
router.get("/users", authenticateToken, checkRole(['admin']), adminController.getUsers);
router.delete("/users/:id", authenticateToken, checkRole(['admin']), adminController.deleteUser);
router.put("/users/:id/role", authenticateToken, checkRole(['admin']), adminController.updateUserRole);

// Routes quản lý khóa học
router.get("/courses", authenticateToken, checkRole(['admin']), adminController.getCourses);
router.put("/courses/:id/approve", authenticateToken, checkRole(['admin']), adminController.approveCourse);
router.put("/courses/:id/reject", authenticateToken, checkRole(['admin']), adminController.rejectCourse);
router.delete("/courses/:id", authenticateToken, checkRole(['admin']), adminController.deleteCourse);

// Routes quản lý đề thi
router.get("/exams", authenticateToken, checkRole(['admin']), adminController.getExams);
router.put("/exams/:id/approve", authenticateToken, checkRole(['admin']), adminController.approveExam);
router.put("/exams/:id/reject", authenticateToken, checkRole(['admin']), adminController.rejectExam);
router.delete("/exams/:id", authenticateToken, checkRole(['admin']), adminController.deleteExam);

// Routes quản lý tin tức
router.get("/news", authenticateToken, checkRole(['admin']), adminController.getNews);
router.post(
  "/news",
  authenticateToken,
  checkRole(['admin']),
  upload.fields([{ name: "image", maxCount: 1 }, { name: "file", maxCount: 1 }]),
  adminController.createNews
);
router.put(
  "/news/:id",
  authenticateToken,
  checkRole(['admin']),
  upload.fields([{ name: "image", maxCount: 1 }, { name: "file", maxCount: 1 }]),
  adminController.updateNews
);
router.put("/news/:id/approve", authenticateToken, checkRole(['admin']), adminController.approveNews);
router.put("/news/:id/reject", authenticateToken, checkRole(['admin']), adminController.rejectNews);
router.delete("/news/:id", authenticateToken, checkRole(['admin']), adminController.deleteNews);

// Routes quản lý tài liệu
router.get("/documents", authenticateToken, checkRole(['admin']), adminController.getDocuments);
router.put("/documents/:id/approve", authenticateToken, checkRole(['admin']), adminController.approveDocument);
router.put("/documents/:id/reject", authenticateToken, checkRole(['admin']), adminController.rejectDocument);
router.delete("/documents/:id", authenticateToken, checkRole(['admin']), adminController.deleteDocument);

// Routes quản lý thư viện
router.get("/bookmarks", authenticateToken, checkRole(['admin']), adminController.getBookmarks);
router.delete("/bookmarks/:id", authenticateToken, checkRole(['admin']), adminController.deleteBookmark);

// Routes quản lý bình luận
router.get("/comments", authenticateToken, checkRole(['admin']), adminController.getComments);
router.delete("/comments/:id", authenticateToken, checkRole(['admin']), adminController.deleteComment);

// Routes quản lý hỏi đáp
router.get("/questions", authenticateToken, checkRole(['admin']), adminController.getQuestions);
router.put("/questions/:id/answer", authenticateToken, checkRole(['admin']), adminController.answerQuestion);
router.delete("/questions/:id", authenticateToken, checkRole(['admin']), adminController.deleteQuestion);

// Routes thống kê
router.get("/stats", authenticateToken, checkRole(['admin']), adminController.getStats);
router.get("/stats/detailed", authenticateToken, checkRole(['admin']), adminController.getDetailedStats);
router.get("/stats/news", authenticateToken, checkRole(['admin']), adminController.getNewsStats);

module.exports = router;