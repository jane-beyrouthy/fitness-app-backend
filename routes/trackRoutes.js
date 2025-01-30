const express = require("express");
const router = express.Router();
const {
  getActivitySummary,
  getChallengeSummary,
} = require("../controllers/trackController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/activities", authMiddleware, getActivitySummary);
router.get("/challenges", authMiddleware, getChallengeSummary);

module.exports = router;
