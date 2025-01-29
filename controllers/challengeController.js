const pool = require("../config/db");

/**
 * @desc Create a challenge
 * @route POST /challenges
 * @access Private
 */
exports.createChallenge = async (req, res) => {
  try {
    const userID = req.user.userID;
    const { title, description, startDate, endDate, reward } = req.body;

    if (!title || !startDate || !endDate) {
      return res
        .status(400)
        .json({ error: "Title, startDate, and endDate are required." });
    }

    const [result] = await pool.query(
      `INSERT INTO Challenge (title, description, startDate, endDate, createdBy, reward)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, description || "", startDate, endDate, userID, reward || ""]
    );

    return res.status(201).json({
      message: "Challenge created successfully.",
      challengeID: result.insertId,
    });
  } catch (error) {
    console.error("Error in createChallenge:", error);
    return res.status(500).json({ error: "Server error." });
  }
};

/**
 * @desc Join a challenge (Send notification to creator)
 * @route POST /challenges/:challengeID/join
 * @access Private
 */
exports.joinChallenge = async (req, res) => {
  try {
    const userID = req.user.userID;
    const { challengeID } = req.params;

    // Check if challenge exists
    const [challenge] = await pool.query(
      `SELECT * FROM Challenge WHERE challengeID = ?`,
      [challengeID]
    );
    if (challenge.length === 0) {
      return res.status(404).json({ error: "Challenge not found." });
    }
    const creatorID = challenge[0].createdBy;

    // Check if user is already in the challenge
    const [existing] = await pool.query(
      `SELECT * FROM UserChallenge WHERE userID = ? AND challengeID = ?`,
      [userID, challengeID]
    );
    if (existing.length > 0) {
      return res
        .status(400)
        .json({ error: "You are already in this challenge." });
    }

    // Join the challenge
    await pool.query(
      `INSERT INTO UserChallenge (userID, challengeID, progress, status)
       VALUES (?, ?, 0, 'ongoing')`,
      [userID, challengeID]
    );

    // Send notification to challenge creator
    await pool.query(
      "INSERT INTO Notification (userID, message, timestamp) VALUES (?, ?, NOW())",
      [creatorID, `A user joined your challenge: "${challenge[0].title}"`]
    );

    return res.json({ message: "Joined the challenge successfully." });
  } catch (error) {
    console.error("Error in joinChallenge:", error);
    return res.status(500).json({ error: "Server error." });
  }
};
