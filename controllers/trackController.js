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

/**
 * getChallengeSummary
 * - Returns the user's ongoing and completed challenges
 */
exports.getChallengeSummary = async (req, res) => {
  try {
    const userID = req.user.userID;

    // Fetch ongoing challenges
    const [ongoingChallenges] = await pool.query(
      `
      SELECT
        uc.participationID,
        c.challengeID,
        c.title,
        c.description,
        c.startDate,
        c.endDate,
        c.createdBy,
        c.reward,
        uc.status,
        uc.progress,
        uc.joinedAt
      FROM userchallenge uc
      JOIN challenge c ON uc.challengeID = c.challengeID
      WHERE uc.userID = ?
        AND uc.status = 'ongoing'
    `,
      [userID]
    );

    // Fetch completed challenges
    const [completedChallenges] = await pool.query(
      `
      SELECT
        uc.participationID,
        c.challengeID,
        c.title,
        c.description,
        c.startDate,
        c.endDate,
        c.createdBy,
        c.reward,
        uc.status,
        uc.progress,
        uc.joinedAt
      FROM userchallenge uc
      JOIN challenge c ON uc.challengeID = c.challengeID
      WHERE uc.userID = ?
        AND uc.status = 'completed'
    `,
      [userID]
    );

    // Return both lists
    return res.json({
      ongoing: ongoingChallenges,
      completed: completedChallenges,
    });
  } catch (error) {
    console.error("Error fetching challenge summary:", error);
    return res.status(500).json({ error: "Server error." });
  }
};
