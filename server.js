require("dotenv").config(); // Load environment variables
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors"); // Add CORS to avoid cross-origin issues
const routes = require("./routes"); // Import the routes from routes.js

const app = express();
const port = 3000;

// Middleware to handle JSON payloads
app.use(bodyParser.json());
app.use(cors()); // Enable CORS for all routes

// Basic route to handle GET /
app.get("/", (req, res) => {
  res.send("Welcome to the Capital One API and Blockchain Integration!");
});

// Use routes from routes.js for customer, account, transaction handling
app.use("/", routes);

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
