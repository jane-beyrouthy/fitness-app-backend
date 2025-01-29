const express = require("express");
const router = express.Router();
const { logActivity } = require("../controllers/activityController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/log", authMiddleware, logActivity);

// Export router for use in main application
module.exports = router;
