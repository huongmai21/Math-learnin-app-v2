// routes/examRoutes.js
const express = require("express");
const router = express.Router();
const {authenticateToken,checkRole} = require("../middleware/authMiddleware");
const {
  getAllExams,
  getRecommendedExams,
  followExam,
  getExamAnswers,
  getGlobalLeaderboard,
  getExamLeaderboard,
  submitExam,
  createExam,
  updateExam,
  deleteExam,
  createExamForCourse,
  takeExam,
  getExamsByCourse,
  addQuestionToExam,
  updateQuestionInExam,
  deleteQuestionFromExam,
  updateSubmissionScore,
  getExamSubmissions,
  getExamQuestions,
  getUserExamResult,
  createReminder,
} = require("../controllers/examController");


router.get("/", getAllExams);
router.get(
  "/recommended",
  authenticateToken,
  getRecommendedExams
);
router.post("/:id/follow", authenticateToken, followExam);
router.get("/:id/answers", authenticateToken, getExamAnswers);
router.get("/leaderboard/global", getGlobalLeaderboard);
router.get("/:id/leaderboard", getExamLeaderboard);
router.post(
  "/:examId/submit",
  authenticateToken,
  submitExam
);

router.post(
  "/",
  authenticateToken,
  checkRole("teacher", "admin"),
  createExam
);
router.put(
  "/:id",
  authenticateToken,
  checkRole("teacher", "admin"),
  updateExam
);
router.delete(
  "/:id",
  authenticateToken,
  checkRole("teacher", "admin"),
  deleteExam
);

router.post(
  "/courses/:courseId/exams",
  authenticateToken,
  checkRole("teacher", "admin"),
  createExamForCourse
);
router.get(
  "/:examId/take",
  authenticateToken,
  takeExam
);
router.put(
  "/:examId/submissions/:submissionId/grade",
  authenticateToken,
  checkRole(["teacher", "admin"]),
  updateSubmissionScore
);

router.get(
  "/courses/:courseId",
  authenticateToken,
  getExamsByCourse
);

router.post(
  "/:examId/questions",
  authenticateToken,
  checkRole("teacher", "admin"),
  addQuestionToExam
);
router.put(
  "/:examId/questions/:questionId",
  authenticateToken,
  checkRole("teacher", "admin"),
  updateQuestionInExam
);
router.delete(
  "/:examId/questions/:questionId",
  authenticateToken,
  checkRole("teacher", "admin"),
  deleteQuestionFromExam
);

router.get(
  "/:examId/submissions",
  authenticateToken,
  checkRole("teacher", "admin"),
  getExamSubmissions
);

router.get(
  "/questions",
  authenticateToken,
  checkRole("teacher", "admin"),
  getExamQuestions
);
router.get(
  "/:examId/result/:userId",
  authenticateToken,
  getUserExamResult
);

router.post("/:examId/reminder", authenticateToken, createReminder);

module.exports = router;
