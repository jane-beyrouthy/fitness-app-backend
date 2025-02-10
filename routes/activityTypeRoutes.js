const express = require("express");
const router = express.Router();
const { getActivityTypes } = require("../controllers/activityTypeController");

router.get("/", getActivityTypes); // Public route to get all activity types

module.exports = router;
