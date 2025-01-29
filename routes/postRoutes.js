const express = require("express");
const router = express.Router();
const { likePost, commentOnPost } = require("../controllers/postController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/:postID/like", authMiddleware, likePost);
router.post("/:postID/comment", authMiddleware, commentOnPost);

module.exports = router;
