const axios = require("axios");

const apiKey = process.env.API_KEY;
const customerId = process.env.CUSTOMER_ID;
const url = `http://api.nessieisreal.com/customers/${customerId}/accounts?key=${apiKey}`;

// Function to create a mock account with Capital One
async function createMockAccount() {
  const payload = {
    type: "Savings",
    nickname: "JohnDoe",
    rewards: 10000,
    balance: 10000,
  };

  const response = await axios.post(url, payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (response.status !== 201) {
    throw new Error("Capital One: Account creation failed.");
  }

  return response.data;
}

module.exports = {
  createMockAccount,
};
