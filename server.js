require("dotenv").config(); // Load environment variables
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const routes = require("./routes"); // Routes are handled separately

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors()); // Enable cross-origin requests

// Default route
app.get("/", (req, res) => {
  res.send("Welcome to the All-In-One Financial Platform!");
});

// Use the API routes from routes.js
app.use("/", routes);

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
