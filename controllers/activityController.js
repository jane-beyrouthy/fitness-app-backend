const pool = require("../config/db");

/**
 * 2. Log Activities/Post
 * -Logs an activity for a user in the Activity table
 * -Optional: Post an activity to the user's feed
 */
exports.logActivity = async (req, res) => {
  try {
    const userID = req.user.userID; //from JWT
    const { activityTypeID, duration, content, imageURL } = req.body;

    if (!activityTypeID || !duration) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    // Get caloriesPerMinute for the activity type
    const [activityType] = await pool.query(
      `SELECT caloriesPerMinute FROM activitytype WHERE activityTypeID = ?`,
      [activityTypeID]
    );

    if (activityType.length === 0) {
      return res.status(404).json({ error: "Invalid activity type." });
    }

    // Calculate calories burned
    const caloriesBurned = activityType[0].caloriesPerMinute * duration;

    //1- Insert activity into Activity table
    const [activityResult] = await pool.query(
      `INSERT INTO activity (userID, activityTypeID, duration, caloriesBurned, timestamp)
       VALUES (?, ?, ?, ?, NOW())`,
      [userID, activityTypeID, duration, caloriesBurned]
    );

    //2- Optional: Post activity to user's feed
    let postID = null;
    if (content || imageURL) {
      const [postResult] = await pool.query(
        `INSERT INTO Post (activityID, userID, content, imageURL, timestamp) VALUES (?, ?, ?, ?, NOW())`,
        [activityResult.insertId, userID, content || "", imageURL || ""]
      );
      postID = postResult.insertId;
    }

    return res.status(201).json({
      message: "Activity logged successfully.",
      activityID: activityResult.insertId,
      postID: postID || null,
    });
  } catch (error) {
    console.error("Error logging activity:", error);
    return res.status(500).json({ error: "Server error." });
  }
};
