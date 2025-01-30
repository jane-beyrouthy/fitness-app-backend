const express = require("express");
const router = express.Router();
const { getActivitySummary } = require("../controllers/trackController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/activities", authMiddleware, getActivitySummary);

module.exports = router;
