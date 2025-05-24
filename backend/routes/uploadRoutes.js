const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/authMiddleware");
const uploadController = require("../controllers/uploadController");

router.post("/image", uploadController.uploadImage);
router.post("/file", authenticateToken, uploadController.uploadFile);

module.exports = router;
