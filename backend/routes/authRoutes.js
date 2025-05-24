// backend/routes/authRoutes.js
const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  refreshToken,
  logout, 
} = require("../controllers/authController");
const { authenticateToken } = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticateToken, getMe);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/logout", authenticateToken, logout);
router.post("/refresh-token", refreshToken);

module.exports = router;