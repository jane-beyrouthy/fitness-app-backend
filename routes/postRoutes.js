const express = require("express");
const router = express.Router();
const {
  likePost,
  commentOnPost,
  getPostsFeed,
  getPostDetails,
  getPostComments,
} = require("../controllers/postController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/:postID/like", authMiddleware, likePost);
router.post("/:postID/comment", authMiddleware, commentOnPost);
router.get("/feed", authMiddleware, getPostsFeed);
router.get("/:postID/details", authMiddleware, getPostDetails);
router.get("/:postID/comments-list", authMiddleware, getPostComments);

module.exports = router;
