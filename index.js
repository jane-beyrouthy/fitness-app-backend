require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Fitness app backend running");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
