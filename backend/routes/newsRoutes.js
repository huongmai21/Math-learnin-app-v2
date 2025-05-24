const express = require("express");
const router = express.Router();
const {
  getAllNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
  getNewsSuggestions,
  getFeaturedNews
} = require("../controllers/newsController");
const {
  authenticateToken,
  checkRole,
} = require("../middleware/authMiddleware");

router.get("/", getAllNews);
router.get("/featured", getFeaturedNews); // Thêm route cho tin tức nổi bật
router.get("/suggestions", getNewsSuggestions);
router.get("/:id", getNewsById);
router.post("/create", authenticateToken, checkRole(["admin"]), createNews);
router.put("/update/:id", authenticateToken, checkRole(["admin"]), updateNews);
router.delete("/:id", authenticateToken, checkRole(["admin"]), deleteNews);

module.exports = router;