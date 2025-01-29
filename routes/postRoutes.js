const express = require("express");
const router = express.Router();
const { likePost } = require("../controllers/postController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/:postID/like", authMiddleware, likePost);

module.exports = router;
