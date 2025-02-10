const pool = require("../config/db");

/**
 * @desc Like a post
 * @route POST /posts/:postID/like
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
    const [result] = await pool.query(
      "INSERT INTO Likes (postID, userID, timestamp) VALUES (?, ?, Now())",
      [postID, userID]
    );

    // Send notification to the post owner
    if (postOwnerID !== userID) {
      // Prevent self-notification
      await pool.query(
        "INSERT INTO Notification (userID, message, timestamp) VALUES (?, ?, Now())",
        [postOwnerID, `${likerUsername} liked your post.`]
      );
    }

    return res
      .status(201)
      .json({ message: "Post liked successfully.", likeID: result.insertId });
  } catch (error) {
    console.error("Error in likePost:", error);
    return res.status(500).json({ error: "Server error." });
  }
};

/**
 * @desc Comment on a post
 * @route POST /posts/:postID/comment
 * @access Private
 */
exports.commentOnPost = async (req, res) => {
  try {
    const userID = req.user.userID;

    // Retrieve the username of the commenter
    const [userRows] = await pool.query(
      "SELECT username FROM User WHERE userID = ?",
      [userID]
    );
    if (userRows.length === 0) {
      return res.status(400).json({ error: "Invalid user." });
    }
    const commenterUsername = userRows[0].username;

    const { postID } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: "Comment content is required." });
    }

    // Retrieve the post owner
    const [postRows] = await pool.query(
      "SELECT userID FROM Post WHERE postID = ?",
      [postID]
    );
    if (postRows.length === 0) {
      return res.status(404).json({ error: "Post not found." });
    }
    const postOwnerID = postRows[0].userID;

    // Insert comment
    const [result] = await pool.query(
      "INSERT INTO Comment (postID, userID, content, timestamp) VALUES (?, ?, ?, Now())",
      [postID, userID, content]
    );

    // Send notification to the post owner
    if (postOwnerID !== userID) {
      // Prevent self-notification
      await pool.query(
        "INSERT INTO Notification (userID, message, timestamp) VALUES (?, ?, Now())",
        [postOwnerID, `${commenterUsername} commented on your post`]
      );
    }

    return res.status(201).json({
      message: "Comment added successfully.",
      commentID: result.insertId,
    });
  } catch (error) {
    console.error("Error in commentOnPost:", error);
    return res.status(500).json({ error: "Server error." });
  }
};

/**
 * @desc Get all posts with like count and comment count
 * @route GET /posts/feed
 * @access Private
 */
exports.getPostsFeed = async (req, res) => {
  try {
    const [posts] = await pool.query(`
      SELECT 
        p.postID, 
        p.activityID, 
        p.userID, 
        p.content, 
        p.imageURL, 
        p.timestamp, 
        u.username, 
        u.firstName, 
        u.lastName,
        (SELECT COUNT(*) FROM likes WHERE likes.postID = p.postID) AS likeCount,
        (SELECT COUNT(*) FROM comment WHERE comment.postID = p.postID) AS commentCount
      FROM post p
      JOIN user u ON p.userID = u.userID
      ORDER BY p.timestamp DESC
    `);

    return res.status(200).json({ posts });
  } catch (error) {
    console.error("Error fetching posts feed:", error);
    return res
      .status(500)
      .json({ error: "Server error. Please try again later." });
  }
};
