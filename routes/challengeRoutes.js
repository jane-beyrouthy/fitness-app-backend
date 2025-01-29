const express = require("express");
const router = express.Router();
const {
  createChallenge,
  joinChallenge,
} = require("../controllers/challengeController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, createChallenge);
router.post("/:challengeID/join", authMiddleware, joinChallenge);

module.exports = router;
