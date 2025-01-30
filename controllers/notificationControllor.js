const pool = require("../config/db");

/**
 * Fetch only unread notifications for the logged-in user
 */
exports.getNotifications = async (req, res) => {
  try {
    const userID = req.user.userID;

    // Fetch only unread notifications (isRead = 0)
    const [notifications] = await pool.query(
      `SELECT notificationID, message, timestamp, isRead
       FROM notification
       WHERE userID = ? AND isRead = 0
       ORDER BY timestamp DESC`,
      [userID]
    );

    return res.json({ notifications });
  } catch (error) {
    console.error("Error fetching unread notifications:", error);
    return res.status(500).json({ error: "Server error." });
  }
};
