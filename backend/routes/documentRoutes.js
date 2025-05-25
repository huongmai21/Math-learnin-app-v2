const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/authMiddleware");
const {
  createDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
  // searchDocuments,
  getPopularDocuments,
  getRelatedDocuments,
  downloadDocument,
  convertDocumentFormat,
} = require("../controllers/documentController");
const upload = require("../middleware/multer");

router
  .route("/")
  .get(getDocuments)
  .post(
    authenticateToken,
    upload.fields([
      { name: "file", maxCount: 1 },
      { name: "thumbnail", maxCount: 1 },
    ]),
    createDocument
  );
// router.route("/search").get(searchDocuments);
router.route("/popular").get(getPopularDocuments);
router.route("/related").get(getRelatedDocuments);
router
  .route("/:id")
  .get(getDocumentById)
  .put(
    authenticateToken,
    upload.fields([
      { name: "file", maxCount: 1 },
      { name: "thumbnail", maxCount: 1 },
    ]),
    updateDocument
  )
  .delete(authenticateToken, deleteDocument);
router.route("/:id/download").get(downloadDocument);
router.route("/:id/convert").get(convertDocumentFormat);

module.exports = router;
