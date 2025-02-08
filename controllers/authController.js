const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.registerUser = async (req, res) => {
  try {
    const { firstName, lastName, username, email, password } = req.body;

    if (!firstName || !lastName || !username || !email || !password) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // Check if email or username already exists
    const [existingUser] = await pool.query(
      "SELECT userID FROM user WHERE email = ? OR username = ?",
      [email, username]
    );
    if (existingUser.length > 0) {
      return res
        .status(400)
        .json({ error: "Email or Username already in use." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into the database
    const [result] = await pool.query(
      "INSERT INTO user (firstName, lastName, username, email, password) VALUES (?, ?, ?, ?, ?)",
      [firstName, lastName, username, email, hashedPassword]
    );

    return res.status(201).json({
      message: "User registered successfully.",
      userID: result.insertId,
      firstName: firstName,
      lastName: lastName,
      username: username,
      email: email,
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
    return res.status(200).json({ token, username: user[0].username });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Server error." });
  }
};
