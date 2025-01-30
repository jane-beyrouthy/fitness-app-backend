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

/**
 * Mark all unread notifications as read
 */
exports.markAsRead = async (req, res) => {
  try {
    const userID = req.user.userID;

    // Update all notifications for this user where isRead = 0
    const [result] = await pool.query(
      `UPDATE notification
       SET isRead = 1
       WHERE userID = ? AND isRead = 0`,
      [userID]
    );

    if (result.affectedRows === 0) {
      return res
        .status(200)
        .json({ message: "No unread notifications to mark as read." });
    }

    return res.json({
      message: "All unread notifications have been marked as read.",
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return res.status(500).json({ error: "Server error." });
  }
};
