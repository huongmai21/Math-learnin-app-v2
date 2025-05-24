const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/authMiddleware");
const {
  createDocument,
  getDocuments,
  getDocumentById,
  searchDocuments,
  getPopularDocuments,
  getRelatedDocuments,
  downloadDocument,
  convertDocumentFormat,
} = require("../controllers/documentController");

router.route("/").get(getDocuments).post(authenticateToken, createDocument);
router.route("/search").get(searchDocuments);
router.route("/popular").get(getPopularDocuments);
router.route("/related").get(getRelatedDocuments);
router.route("/:id").get(getDocumentById);
router.route("/:id/download").get(downloadDocument);
router.route("/:id/convert").get(convertDocumentFormat);

module.exports = router;
