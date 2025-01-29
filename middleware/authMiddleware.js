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
    // Decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the userID to req.user
    req.user = { userID: decoded.userID };

    // Proceed to the next middleware/controller
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token." });
  }
};
