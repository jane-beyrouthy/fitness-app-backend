const pool = require("../config/db");

/**
 * @desc Send a friend request
 * @route POST /friends/follow
 * @access Private
 */
exports.followUser = async (req, res) => {
  try {
    const userID = req.user.userID; // from JWT
    // Retrieve the username of the sender
    const [user] = await pool.query(
      "SELECT username FROM User WHERE userID = ?",
      [userID]
    );
    if (user.length === 0) {
      return res.status(400).json({ error: "Invalid user." });
    }
    const senderUsername = user[0].username;

    const { friendUsername } = req.body;
    if (!friendUsername) {
      return res.status(400).json({ error: "Friend email is required." });
    }

    // 1) Retrieve friend's userID
    const [friendRows] = await pool.query(
      "SELECT userID FROM User WHERE username = ?",
      [friendUsername]
    );
    if (friendRows.length === 0) {
      return res
        .status(404)
        .json({ error: "No user found with that username." });
    }

    const friendID = friendRows[0].userID;
    if (friendID === userID) {
      return res.status(400).json({ error: "You cannot follow yourself." });
    }

    // 2) Check if already following or request pending
    const [existing] = await pool.query(
      "SELECT status FROM UserFriend WHERE userID = ? AND friendID = ?",
      [userID, friendID]
    );

    if (existing.length > 0 && existing[0].status === "accepted") {
      return res
        .status(400)
        .json({ error: "You are already following this user." });
    }

    // 3) Insert follow
    await pool.query(
      `INSERT INTO userfriend (userID, friendID, status, createdAt)
       VALUES (?, ?, 'accepted', NOW())
       ON DUPLICATE KEY UPDATE status = 'accepted', createdAt = NOW()`,
      [userID, friendID]
    );

    // 4) Send Notification
    await pool.query(
      "INSERT INTO Notification (userID, message, timestamp) VALUES (?, ?, NOW())",
      [friendID, `${senderUsername} is now following you.`]
    );

    return res.status(201).json({
      message: "Friend request sent successfully.",
      requestedTo: {
        userID: friendID,
        username: friendUsername,
      },
    });
  } catch (error) {
    console.error("Error in followUser:", error);
    return res
      .status(500)
      .json({ error: "Server error. Please try again later." });
  }
};

/**
 * @desc Unfollow a user (Change status to "rejected")
 * @route POST /friends/unfollow
 * @access Private
 */
exports.unfollowUser = async (req, res) => {
  try {
    const userID = req.user.userID;
    const { friendID } = req.body;

    if (!friendID) {
      return res.status(400).json({ error: "Friend ID is required." });
    }

    // Check if a following relationship exists
    const [rows] = await pool.query(
      `SELECT status FROM UserFriend 
       WHERE userID = ? AND friendID = ?`,
      [userID, friendID]
    );

    if (rows.length === 0 && rows[0].status !== "accepted") {
      return res
        .status(400)
        .json({ error: "You are not following this user." });
    }

    const currentStatus = rows[0].status;

    if (currentStatus === "rejected") {
      return res.status(400).json({ error: "Already unfollowed." });
    }

    // Update the status to "rejected"
    await pool.query(
      `UPDATE UserFriend 
       SET status = "rejected" 
       WHERE userID = ? AND friendID = ?`,
      [userID, friendID, friendID, userID]
    );

    // Retrieve the friend's username and email
    const [friendRows] = await pool.query(
      "SELECT username FROM User WHERE userID = ?",
      [friendID]
    );
    if (friendRows.length === 0) {
      return res.status(400).json({ error: "Invalid friend ID." });
    }
    const friendUsername = friendRows[0].username;

    return res.status(200).json({
      message: `Friendship status updated to "rejected".`,
      updatedUser: {
        userID: friendID,
        username: friendUsername,
      },
    });
  } catch (error) {
    console.error("Error in rejectRequest:", error);
    return res
      .status(500)
      .json({ error: "Server error. Please try again later." });
  }
};

/**
 * @desc Get list of friends
 * @route GET /friends
 * @access Private
 */
exports.getFriends = async (req, res) => {
  try {
    const userID = req.user.userID;

    // Retrieve friends list where status is "accepted"
    const [friends] = await pool.query(
      `SELECT uf.friendID AS friendID, u.username, u.email
       FROM UserFriend uf
       JOIN User u ON uf.friendID = u.userID
       WHERE uf.userID = ? AND uf.status = "accepted"`,
      [userID]
    );

    return res.status(200).json({ friends });
  } catch (error) {
    console.error("Error in getFriends:", error);
    return res
      .status(500)
      .json({ error: "Server error. Please try again later." });
  }
};
