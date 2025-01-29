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

    const { friendEmail } = req.body;
    if (!friendEmail) {
      return res.status(400).json({ error: "Friend email is required." });
    }

    // 1) Retrieve friend's userID and username
    const [friendRows] = await pool.query(
      "SELECT userID, username FROM User WHERE email = ?",
      [friendEmail]
    );
    if (friendRows.length === 0) {
      return res.status(404).json({ error: "No user found with that email." });
    }

    const friendID = friendRows[0].userID;
    const friendUsername = friendRows[0].username;
    if (friendID === userID) {
      return res.status(400).json({ error: "You cannot follow yourself." });
    }

    // 2) Check if already following or request pending
    const [existing] = await pool.query(
      "SELECT status FROM UserFriend WHERE userID = ? AND friendID = ?",
      [userID, friendID]
    );

    if (existing.length > 0) {
      return res
        .status(400)
        .json({ error: "Already following or request pending." });
    }

    // 3) Insert follow request
    await pool.query(
      'INSERT INTO UserFriend (userID, friendID, status, createdAt) VALUES (?, ?, "pending", NOW())',
      [userID, friendID]
    );

    // 4) Send Notification
    await pool.query(
      "INSERT INTO Notification (userID, message, timestamp) VALUES (?, ?, NOW())",
      [friendID, `You have a new friend request from ${senderUsername}`]
    );

    return res.status(201).json({
      message: "Friend request sent successfully.",
      requestedTo: {
        userID: friendID,
        username: friendUsername,
        email: friendEmail,
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
 * @desc Accept a friend request
 * @route POST /friends/accept
 * @access Private
 */
exports.acceptRequest = async (req, res) => {
  try {
    const userID = req.user.userID; // from JWT

    // Retrieve the username of the receiver
    const [user] = await pool.query(
      "SELECT username FROM User WHERE userID = ?",
      [userID]
    );
    if (user.length === 0) {
      return res.status(400).json({ error: "Invalid user." });
    }
    const receiverUsername = user[0].username;

    const { friendID } = req.body;
    if (!friendID) {
      return res.status(400).json({ error: "Friend ID is required." });
    }

    // Check if the friend request exists and is pending
    const [rows] = await pool.query(
      'SELECT * FROM UserFriend WHERE userID = ? AND friendID = ? AND status = "pending"',
      [friendID, userID]
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: "No pending request found." });
    }

    // Retrieve friend's username
    const [friendRows] = await pool.query(
      "SELECT username, email FROM User WHERE userID = ?",
      [friendID]
    );
    if (friendRows.length === 0) {
      return res.status(400).json({ error: "Invalid friend ID." });
    }
    const friendUsername = friendRows[0].username;
    const friendEmail = friendRows[0].email;

    // Update the status to "accepted"
    await pool.query(
      'UPDATE UserFriend SET status = "accepted" WHERE userID = ? AND friendID = ?',
      [friendID, userID]
    );

    // Send Notification
    await pool.query(
      "INSERT INTO Notification (userID, message) VALUES (?, ?)",
      [friendID, `Your friend request was accepted by ${receiverUsername}`]
    );

    return res.status(200).json({
      message: "Friend request accepted.",
      friend: {
        userID: friendID,
        username: friendUsername,
        email: friendEmail,
      },
    });
  } catch (error) {
    console.error("Error in acceptRequest:", error);
    return res
      .status(500)
      .json({ error: "Server error. Please try again later." });
  }
};

/**
 * @desc Reject a friend request or unfollow (Change status to "rejected")
 * @route POST /friends/reject
 * @access Private
 */
exports.rejectRequest = async (req, res) => {
  try {
    const userID = req.user.userID;
    const { friendID } = req.body;

    if (!friendID) {
      return res.status(400).json({ error: "Friend ID is required." });
    }

    // Check if a friendship or request exists
    const [rows] = await pool.query(
      `SELECT status FROM UserFriend 
       WHERE ((userID = ? AND friendID = ?) OR (userID = ? AND friendID = ?))`,
      [userID, friendID, friendID, userID]
    );

    if (rows.length === 0) {
      return res
        .status(400)
        .json({ error: "No friend request or friendship found." });
    }

    const currentStatus = rows[0].status;

    // If the current status is neither pending nor accepted, we shouldn't update
    if (currentStatus !== "pending" && currentStatus !== "accepted") {
      return res
        .status(400)
        .json({ error: `Cannot update status from "${currentStatus}".` });
    }

    // Update the status to "rejected" regardless of whether it was pending or accepted
    await pool.query(
      `UPDATE UserFriend 
       SET status = "rejected" 
       WHERE ((userID = ? AND friendID = ?) OR (userID = ? AND friendID = ?))`,
      [userID, friendID, friendID, userID]
    );

    // Retrieve the friend's username and email
    const [friendRows] = await pool.query(
      "SELECT username, email FROM User WHERE userID = ?",
      [friendID]
    );
    if (friendRows.length === 0) {
      return res.status(400).json({ error: "Invalid friend ID." });
    }
    const friendUsername = friendRows[0].username;
    const friendEmail = friendRows[0].email;

    return res.status(200).json({
      message: `Friendship status updated to "rejected".`,
      updatedUser: {
        userID: friendID,
        username: friendUsername,
        email: friendEmail,
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
