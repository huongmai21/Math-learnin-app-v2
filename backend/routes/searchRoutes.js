// backend/routes/searchRoutes.js
const express = require("express");
const router = express.Router();
const { searchResources } = require("../controllers/searchController");

router.get("/", searchResources);

module.exports = router;