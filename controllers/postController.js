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
 * @desc Get posts from users the logged-in user is following
 * @route GET /posts/feed
 * @access Private
 */
exports.getPostsFeed = async (req, res) => {
  try {
    const userID = req.user.userID; // Get logged-in user ID from JWT

    const [posts] = await pool.query(
      `
      SELECT 
        p.postID, 
        p.activityID, 
        p.userID, 
        p.content,
        p.timestamp, 
        u.username, 
        u.firstName, 
        u.lastName,
        (SELECT COUNT(*) FROM likes WHERE likes.postID = p.postID) AS likeCount,
        (SELECT COUNT(*) FROM comment WHERE comment.postID = p.postID) AS commentCount,
        a.duration,
        a.caloriesBurned,
        at.name AS activityTypeName
      FROM post p
      JOIN user u ON p.userID = u.userID
      LEFT JOIN activity a ON p.activityID = a.activityID
      LEFT JOIN activitytype at ON a.activityTypeID = at.activityTypeID
      WHERE p.userID IN (
        SELECT friendID FROM userfriend WHERE userID = ? AND status = 'accepted'
      )
      ORDER BY p.timestamp DESC
    `,
      [userID]
    );

    // Check if the feed is empty
    if (posts.length === 0) {
      return res
        .status(200)
        .json({ message: "No posts available. Your feed is empty." });
    }

    return res.status(200).json({ posts });
  } catch (error) {
    console.error("Error fetching posts feed:", error);
    return res
      .status(500)
      .json({ error: "Server error. Please try again later." });
  }
};

/**
 * @desc Get post details
 * @route GET /posts/:postID/details
 * @access Private
 */
exports.getPostDetails = async (req, res) => {
  try {
    const { postID } = req.params;

    const [post] = await pool.query(
      `SELECT 
        p.postID, 
        p.content, 
        p.timestamp,
        u.userID,
        u.username,
        u.firstName, 
        u.lastName,
        at.name AS activityTypeName,
        a.duration,
        a.caloriesBurned,
        (SELECT COUNT(*) FROM likes WHERE likes.postID = p.postID) AS likeCount,
        (SELECT COUNT(*) FROM comment WHERE comment.postID = p.postID) AS commentCount
      FROM post p
      JOIN user u ON p.userID = u.userID
      LEFT JOIN activity a ON p.activityID = a.activityID
      LEFT JOIN activitytype at ON a.activityTypeID = at.activityTypeID
      WHERE p.postID = ?`,
      [postID]
    );

    if (post.length === 0) {
      return res.status(404).json({ error: "Post not found." });
    }

    return res.status(200).json({ post: post[0] });
  } catch (error) {
    console.error("Error fetching post details:", error);
    return res
      .status(500)
      .json({ error: "Server error. Please try again later." });
  }
};

/**
 * @desc Get all comments for a specific post
 * @route GET /posts/:postID/comments-list
 * @access Private
 */
exports.getPostComments = async (req, res) => {
  try {
    const { postID } = req.params;

    // Check if postID is provided and is a number
    if (!postID || isNaN(postID)) {
      return res.status(400).json({ error: "Invalid or missing post ID." });
    }

    const [comments] = await pool.query(
      `SELECT 
        c.commentID, 
        c.content, 
        c.timestamp,
        u.userID, 
        u.username, 
        u.firstName, 
        u.lastName
      FROM comment c
      JOIN user u ON c.userID = u.userID
      WHERE c.postID = ?
      ORDER BY c.timestamp ASC`,
      [postID]
    );

    return res.status(200).json({ comments } || []);
  } catch (error) {
    console.error("Error fetching post comments:", error);
    return res
      .status(500)
      .json({ error: "Server error. Please try again later." });
  }
};
