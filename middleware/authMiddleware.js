const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ error: "Authorization header required." });
  }
  const token = authHeader.split(" ")[1]; // Bearer token
  if (!token) {
    return res.status(401).json({ error: "Authorization token required." });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userID = decoded.userID;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token." });
  }
};
