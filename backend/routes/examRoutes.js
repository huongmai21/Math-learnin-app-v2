// routes/examRoutes.js
const express = require("express");
const router = express.Router();
const examController = require("../controllers/examController");
const {authenticateToken,checkRole} = require("../middleware/authMiddleware");
// const checkRole = require("../middleware/roleMiddleware");

// Routes không yêu cầu quyền cụ thể
router.get("/", examController.getAllExams);
router.get(
  "/recommended",
  authenticateToken,
  examController.getRecommendedExams
);
router.post("/:id/follow", authenticateToken, examController.followExam);
router.get("/:id/answers", authenticateToken, examController.getExamAnswers);
router.get("/leaderboard/global", examController.getGlobalLeaderboard);
router.get("/:id/leaderboard", examController.getExamLeaderboard);

// Routes yêu cầu quyền teacher hoặc admin
router.post(
  "/",
  authenticateToken,
  checkRole("teacher", "admin"),
  examController.createExam
);
router.put(
  "/:id",
  authenticateToken,
  checkRole("teacher", "admin"),
  examController.updateExam
);
router.delete(
  "/:id",
  authenticateToken,
  checkRole("teacher", "admin"),
  examController.deleteExam
);

module.exports = router;
