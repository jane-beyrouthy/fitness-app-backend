const express = require("express");
const router = express.Router();
const { searchUsers } = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/search", authMiddleware, searchUsers); // Protected route

module.exports = router;
