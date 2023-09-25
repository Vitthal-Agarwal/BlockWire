const { createMockAccount } = require("./capitalOneAPI");
const { createHederaAccount } = require("./hedera");
const { storeUserInDB } = require("./database");

// Function to handle user registration
async function registerUser(req, res) {
  try {
    const mockAccount = await createMockAccount();
    const hederaAccount = await createHederaAccount();

    const connectDB = require("./db");
    connectDB();

    // Store the accounts in the database
    await storeUserInDB(mockAccount, hederaAccount);

    // Send a success response
    res.json({ success: true, mockAccount, hederaAccount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  registerUser,
};
