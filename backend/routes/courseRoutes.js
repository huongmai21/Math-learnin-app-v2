const express = require("express");
const router = express.Router();
const {
  getCourses,
  getCourse,
  getMyCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollCourse,
  createPaymentIntent,
  addCourseContent,
  updateCourseContent,
  deleteCourseContent,
  updateProgress,
  getProgress,
  createReview,
  getReviews,
  approveCourse,
  rejectCourse,
  confirmPayment,
  getCourseEnrollments,
  // approveReview,
} = require("../controllers/courseController");
const {
  authenticateToken,
  checkRole,
} = require("../middleware/authMiddleware");

router.get("/", getCourses);
router.get("/my-courses", authenticateToken, getMyCourses);
router.post(
  "/",
  authenticateToken,
  checkRole("teacher", "admin"),
  createCourse
);
router.get("/:id", getCourse);
router.put(
  "/:id",
  authenticateToken,
  checkRole("teacher", "admin"),
  updateCourse
);
router.delete(
  "/:id",
  authenticateToken,
  checkRole("admin"),
  deleteCourse
);
router.put(
  "/:id/approve",
  authenticateToken,
  checkRole("admin"),
  approveCourse
);
router.put(
  "/:id/reject",
  authenticateToken,
  checkRole("admin"),
  rejectCourse
);
router.post("/enroll", authenticateToken, enrollCourse);
router.post("/:id/payment", authenticateToken, createPaymentIntent);
router.post(
  "/:id/contents",
  authenticateToken,
  checkRole("teacher", "admin"),
  addCourseContent
);
router.put(
  "/:id/contents/:contentId",
  authenticateToken,
  checkRole("teacher", "admin"),
  updateCourseContent
);
router.delete(
  "/:id/contents/:contentId",
  authenticateToken,
  checkRole("teacher", "admin"),
  deleteCourseContent
);
router
  .route("/:courseId/progress")
  .get(authenticateToken, getProgress)
  .post(authenticateToken, updateProgress);
router
  .route("/:courseId/reviews")
  .get(getReviews)
  .post(authenticateToken, createReview);
router.post(
  "/:id/confirm-payment",
  authenticateToken,
  confirmPayment
);
router.get(
  "/:id/enrollments",
  authenticateToken,
  checkRole("teacher", "admin"),
  getCourseEnrollments
);

// router.put(
//   "/reviews/:reviewId/approve",
//   authenticateToken,
//   checkRole("admin"),
//   approveReview
// );

module.exports = router;
