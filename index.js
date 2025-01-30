require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const activityRoutes = require("./routes/activityRoutes");
const friendRoutes = require("./routes/friendRoutes");
const postRoutes = require("./routes/postRoutes");
const challengeRoutes = require("./routes/challengeRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/activity", activityRoutes);
app.use("/friends", friendRoutes);
app.use("/posts", postRoutes);
app.use("/challenges", challengeRoutes);
app.use("/notifications", notificationRoutes);

app.get("/", (req, res) => {
  res.send("Fitness app backend running");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
