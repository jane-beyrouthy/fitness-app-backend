const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Fitness app backend running");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
