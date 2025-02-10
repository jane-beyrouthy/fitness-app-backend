const pool = require("../config/db");

/**
 * @desc Get all activity types
 * @route GET /activity-types
 * @access Public
 */
exports.getActivityTypes = async (req, res) => {
  try {
    // Fetch all activity types
    const [rows] = await pool.query(
      "SELECT activityTypeID, name FROM activitytype"
    );

    return res.status(200).json({ activityTypes: rows });
  } catch (error) {
    console.error("Error fetching activity types:", error);
    return res
      .status(500)
      .json({ error: "Server error. Please try again later." });
  }
};
