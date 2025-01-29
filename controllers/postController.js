const pool = require("../config/db");

/**
 * @desc Like a post
 * @route POST /api/posts/:postID/like
 * @access Private
 */
exports.likePost = async (req, res) => {
  try {
    const userID = req.user.userID;

    // Retrieve the username of the liker
    const [userRows] = await pool.query(
      "SELECT username FROM User WHERE userID = ?",
      [userID]
    );
    if (userRows.length === 0) {
      return res.status(400).json({ error: "Invalid user." });
    }
    const likerUsername = userRows[0].username;

    const { postID } = req.params;

    // Retrieve the post owner
    const [postRows] = await pool.query(
      "SELECT userID FROM Post WHERE postID = ?",
      [postID]
    );
    if (postRows.length === 0) {
      return res.status(404).json({ error: "Post not found." });
    }
    const postOwnerID = postRows[0].userID;

    // Prevent duplicate likes
    const [existingLike] = await pool.query(
      "SELECT * FROM Likes WHERE postID = ? AND userID = ?",
      [postID, userID]
    );
    if (existingLike.length > 0) {
      return res.status(400).json({ error: "You already liked this post." });
    }

    // Insert like
    await pool.query(
      "INSERT INTO Likes (postID, userID, timestamp) VALUES (?, ?, Now())",
      [postID, userID]
    );

    // Send notification to the post owner
    if (postOwnerID !== userID) {
      // Prevent self-notification
      await pool.query(
        "INSERT INTO Notification (userID, message, timestamp) VALUES (?, ?, Now())",
        [postOwnerID, `Your post was liked by ${likerUsername}.`]
      );
    }

    return res.status(201).json({ message: "Post liked successfully." });
  } catch (error) {
    console.error("Error in likePost:", error);
    return res.status(500).json({ error: "Server error." });
  }
};
