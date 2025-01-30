const pool = require("../config/db");

/**
 * getActivitySummary
 * - Returns a summary of activities grouped by activity type
 * - Allows filtering by optional startDate and endDate query params
 *   e.g. /track/activities?startDate=2025-01-01&endDate=2025-01-31
 */
exports.getActivitySummary = async (req, res) => {
  try {
    const userID = req.user.userID;
    const { startDate, endDate } = req.query;

    let query = `
      SELECT
        a.activityTypeID,
        at.name AS activityTypeName,
        COUNT(*) AS totalSessions,
        SUM(a.duration) AS totalDuration,
        SUM(a.caloriesBurned) AS totalCalories
      FROM activity a
      JOIN activitytype at ON a.activityTypeID = at.activityTypeID
      WHERE a.userID = ?
    `;
    const params = [userID];

    // Apply optional date filtering
    if (startDate) {
      query += " AND a.timestamp >= ?";
      params.push(startDate);
    }
    if (endDate) {
      query += " AND a.timestamp <= ?";
      params.push(endDate);
    }

    // Group by the activityTypeID for summaries
    query += " GROUP BY a.activityTypeID";

    // Execute the query
    const [rows] = await pool.query(query, params);

    // Return the aggregated data
    return res.json({
      activities: rows,
    });
  } catch (error) {
    console.error("Error fetching activity summary:", error);
    return res.status(500).json({ error: "Server error." });
  }
};
