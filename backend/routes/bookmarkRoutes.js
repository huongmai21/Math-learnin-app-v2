const express = require("express");
const router = express.Router();
const { addBookmark, removeBookmark, getBookmarks, checkBookmarks } = require("../controllers/bookmarkController");
const { authenticateToken } = require("../middleware/authMiddleware");

// Thêm bookmark
router.post("/", authenticateToken, addBookmark);

// Xóa bookmark
router.delete("/:referenceType/:referenceId", authenticateToken, removeBookmark);

// Lấy danh sách bookmark
router.get("/", authenticateToken, getBookmarks);

// Kiểm tra trạng thái bookmark
router.post("/check", authenticateToken, checkBookmarks);

module.exports = router;