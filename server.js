require("dotenv").config(); // <-- Load environment variables

const express = require("express");
const bodyParser = require("body-parser");
const { registerUser } = require("./routes");

const app = express();
const port = 3000;

// Middleware to handle JSON payloads
app.use(bodyParser.json());

// Route for registering a user
app.post("/register", registerUser);

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
