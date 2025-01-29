const express = require("express");
const router = express.Router();
const {
  createChallenge,
  joinChallenge,
  completeChallenge,
  progressChallenge,
} = require("../controllers/challengeController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, createChallenge);
router.post("/:challengeID/join", authMiddleware, joinChallenge);
router.post("/:challengeID/complete", authMiddleware, completeChallenge);
router.post("/:challengeID/progress", authMiddleware, progressChallenge);

module.exports = router;
