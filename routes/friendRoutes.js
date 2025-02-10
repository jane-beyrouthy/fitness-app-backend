const express = require("express");
const router = express.Router();
const {
  followUser,
  getFriends,
  unfollowUser,
} = require("../controllers/friendController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/follow", authMiddleware, followUser);
router.post("/unfollow", authMiddleware, unfollowUser);
router.get("/", authMiddleware, getFriends);

module.exports = router;
