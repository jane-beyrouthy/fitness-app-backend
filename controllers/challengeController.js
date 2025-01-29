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
