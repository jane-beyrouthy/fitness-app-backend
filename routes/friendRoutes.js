const express = require("express");
const router = express.Router();
const {
  followUser,
  acceptRequest,
  rejectRequest,
  getFriends,
} = require("../controllers/friendController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/follow", authMiddleware, followUser);
router.post("/accept", authMiddleware, acceptRequest);
router.post("/reject", authMiddleware, rejectRequest);
router.get("/", authMiddleware, getFriends);

module.exports = router;
