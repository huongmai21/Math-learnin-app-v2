const express = require("express");
const router = express.Router();
const { searchResources, searchAll } = require("../controllers/searchController");

router.get("/", searchResources);
router.get("/all", searchAll);
router.get("/:type", searchResources);

module.exports = router;