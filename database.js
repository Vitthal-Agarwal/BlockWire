const mongoose = require("mongoose");

// Define the User schema
const UserSchema = new mongoose.Schema({
  mockAccount: {
    type: Object,
    required: true,
  },
  hederaAccount: {
    type: String,
    required: true,
  },
});

// Create a User model from the schema
const User = mongoose.model("User", UserSchema);

async function storeUserInDB(mockAccount, hederaAccount) {
  const user = new User({
    mockAccount,
    hederaAccount,
  });

  await user.save();
  return user;
}

module.exports = {
  storeUserInDB,
};
