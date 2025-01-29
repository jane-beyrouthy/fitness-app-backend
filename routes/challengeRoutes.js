const express = require("express");
const router = express.Router();
const {
  createChallenge,
  joinChallenge,
  completeChallenge,
} = require("../controllers/challengeController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, createChallenge);
router.post("/:challengeID/join", authMiddleware, joinChallenge);
router.post("/:challengeID/complete", authMiddleware, completeChallenge);

module.exports = router;
