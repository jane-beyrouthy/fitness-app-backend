const pool = require("../config/db");

/**
 * @desc Search for users by first name, last name, or username
 * @route GET /users/search
 * @access Private
 */
exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ error: "Search query is required." });
    }

    // Search users by first name, last name, or username
    const [users] = await pool.query(
      `SELECT userID, username, firstName, lastName, email 
       FROM user 
       WHERE firstName LIKE ? OR lastName LIKE ? OR username LIKE ?`,
      [`%${query}%`, `%${query}%`, `%${query}%`]
    );

    return res.status(200).json({ users });
  } catch (error) {
    console.error("Error in searchUsers:", error);
    return res
      .status(500)
      .json({ error: "Server error. Please try again later." });
  }
};
