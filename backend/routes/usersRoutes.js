const express = require("express");
const router = express.Router();
const {
  getProfile,
  getUserActivity,
  updateProfile,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getUserSuggestions,
  changePassword,
  getRecentActivities,
} = require("../controllers/userController");
const {
  authenticateToken,
  checkRole,
} = require("../middleware/authMiddleware");
// const multer = require("multer");
// const path = require("path");

// const storage = multer.memoryStorage();
// const upload = multer({
//   storage: storage,
//   limits: { fileSize: 5 * 1024 * 1024 },
//   fileFilter: (req, file, cb) => {
//     const filetypes = /jpeg|jpg|png/;
//     const extname = filetypes.test(
//       path.extname(file.originalname).toLowerCase()
//     );
//     const mimetype = filetypes.test(file.mimetype);
//     if (extname && mimetype) {
//       return cb(null, true);
//     } else {
//       cb(new Error("Chỉ hỗ trợ file ảnh JPEG, JPG, PNG!"));
//     }
//   },
// });

router
  .route("/profile")
  .get(authenticateToken, getProfile)
  .put(authenticateToken, updateProfile);

router.route("/activity").get(authenticateToken, getUserActivity);
router.route("/recent-activities").get(authenticateToken, getRecentActivities);
router.route("/change-password").put(authenticateToken, changePassword);
router.route("/followers").get(authenticateToken, getFollowers);
router.route("/following").get(authenticateToken, getFollowing); 
router.route("/suggestions").get(authenticateToken, getUserSuggestions);
router.route("/enrolled-courses").get(authenticateToken, async (req, res) => {
  const user = await require("../models/User")
    .findById(req.user._id)
    .populate("enrolledCourses");
  res.status(200).json({ success: true, data: user.enrolledCourses || [] });
});
router.route("/completed-courses").get(authenticateToken, async (req, res) => {
  const user = await require("../models/User")
    .findById(req.user._id)
    .populate("completedCourses");
  res.status(200).json({ success: true, data: user.completedCourses || [] });
});
router.route("/:id/follow").put(authenticateToken, followUser);
router.route("/:id/unfollow").put(authenticateToken, unfollowUser);

module.exports = router;
