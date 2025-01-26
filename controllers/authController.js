const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: "All fields are required." });
    }
    // Check if email already exists
    const [existing] = await pool.query(
      "SELECT userID FROM User WHERE email = ?",
      [email]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: "Email already in use." });
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Insert user
    const [result] = await pool.query(
      "INSERT INTO User (username, email, password) VALUES (?, ?, ?)",
      [username, email, hashedPassword]
    );
    return res.status(201).json({
      message: "User registered successfully.",
      userID: result.insertId,
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ error: "Server error." });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // Check if email exists
    const [user] = await pool.query("SELECT * FROM User WHERE email = ?", [
      email,
    ]);
    if (user.length === 0) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    // Check password
    const match = await bcrypt.compare(password, user[0].password);
    if (!match) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    // Generate JWT
    const token = jwt.sign({ userID: user[0].userID }, process.env.JWT_SECRET);
    return res.status(200).json({ token });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Server error." });
  }
};
