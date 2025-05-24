const express = require("express");
const router = express.Router();
const aiController = require("../controllers/aiController");
const { authenticateToken } = require("../middleware/authMiddleware");

router.post("/math-question", authenticateToken, aiController.askMathQuestion);

module.exports = router;