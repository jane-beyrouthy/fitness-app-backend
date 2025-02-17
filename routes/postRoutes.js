/**
 * Express router for handling post-related routes
 * @module routes/postRoutes
 *
 * @requires express
 * @requires ../controllers/postController
 * @requires ../middleware/authMiddleware
 *
 * Routes:
 * - POST /:postID/like - Like a post
 * - POST /:postID/comment - Add a comment to a post
 * - GET /feed - Get posts feed
 * - GET /:postID/details - Get details of a specific post
 * - GET /:postID/comments-list - Get comments for a specific post
 *
 * @type {express.Router}
 */
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
