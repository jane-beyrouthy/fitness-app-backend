const express = require("express");
const router = express.Router();
const { createChallenge } = require("../controllers/challengeController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, createChallenge);

module.exports = router;
