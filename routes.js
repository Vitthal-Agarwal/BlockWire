require("dotenv").config();
const express = require('express');
const axios = require("axios");

const router = express.Router();
const apiKey = process.env.API_KEY;
const baseUrl = `http://api.nessieisreal.com`;

// Create a new customer
router.post('/create-customer', async (req, res) => {
    const customerUrl = `${baseUrl}/customers?key=${apiKey}`;
  
    // Customer data as per the documentation you shared
    const customerData = {
      "first_name": req.body.first_name,
      "last_name": req.body.last_name,
      "address": {
        "street_number": req.body.street_number,
        "street_name": req.body.street_name,
        "city": req.body.city,
        "state": req.body.state,
        "zip": req.body.zip
      }
    };
  
    try {
      const response = await axios.post(customerUrl, customerData);
      console.log("Customer API Response:", response.data); // Log response
  
      if (response.data && response.data.objectCreated) {
        const customerId = response.data.objectCreated._id;
        res.json({ customerId });
      } else {
        throw new Error("Unexpected response format");
      }
    } catch (error) {
      console.error("Error creating customer:", error.response ? error.response.data : error.message);
      res.status(500).json({ error: "Error creating customer" });
    }
  });

// Function to create an account for a customer
async function createAccountForCustomer(customerId, accountData) {
  const url = `${baseUrl}/customers/${customerId}/accounts?key=${apiKey}`;
  const payload = {
    type: accountData.type,
    nickname: accountData.nickname,
    rewards: accountData.rewards || 0,
    balance: accountData.balance || 0,
  };

  try {
    const response = await axios.post(url, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });


    if (response.status >= 200 && response.status < 300) {
      console.log("Account API Response Data:", response.data);
      return response.data;
    } else {
      throw new Error("Account creation failed with status " + response.status);
    }
  } catch (error) {
    console.error("Error creating account:", error.response ? error.response.data : error.message);
    throw new Error("Error creating account");
  }
}

// Create an account for a customer route
router.post('/create-account', async (req, res) => {
    const { customerId, type, nickname, balance, rewards } = req.body;
  
    if (!customerId || !type || !nickname) {
      return res.status(400).json({ error: "Customer ID, type, and nickname are required to create an account." });
    }
  
    const accountData = { type, nickname, balance: parseFloat(balance), rewards: parseFloat(rewards) };
  
    try {
      const response = await createAccountForCustomer(customerId, accountData);
  
      // Based on the response structure, adjust the way you access accountId
      const accountId = response?.objectCreated?._id || response?.account?.id || response?.accountId; // Adjust based on actual response structure
      if (!accountId) {
        throw new Error("Account ID is undefined in the API response");
      }
  
      res.json({ accountId });
    } catch (error) {
      console.error("Error creating account:", error.response ? error.response.data : error.message);
      res.status(500).json({ error: "Error creating account" });
    }
  });

// Transfer money between accounts
router.post('/transfer-money', async (req, res) => {
  const { senderAccountId, recipientAccountId, amount } = req.body;

  if (!senderAccountId || !recipientAccountId || !amount || amount <= 0) {
    return res.status(400).json({ error: "Invalid input. Please provide valid senderAccountId, recipientAccountId, and a positive amount." });
  }

  const transferUrl = `${baseUrl}/accounts/${senderAccountId}/transfers?key=${apiKey}`;
  const accountUrl = `${baseUrl}/accounts/${senderAccountId}?key=${apiKey}`;

  try {
    const accountResponse = await axios.get(accountUrl);
    const senderBalance = accountResponse.data.balance;

    if (senderBalance < amount) {
      return res.status(400).json({ error: "Insufficient funds" });
    }

    const transferData = {
      "medium": "balance",
      "payee_id": recipientAccountId,
      "amount": amount,
      "description": "Transfer to recipient"
    };

    const response = await axios.post(transferUrl, transferData);
    console.log("Transfer API Response:", response.data);

    res.json({ message: "Transfer successful", transaction: response.data });
  } catch (error) {
    console.error("Error transferring money:", error.response ? error.response.data : error.message);
    res.status(500).json({ error: "Error transferring money" });
  }
});

// Fetch transactions for an account
router.get('/transactions/:accountId', async (req, res) => {
  const { accountId } = req.params;
  const transactionUrl = `${baseUrl}/accounts/${accountId}/transfers?key=${apiKey}`;

  try {
    const response = await axios.get(transactionUrl);
    res.json({ transfers: response.data });
  } catch (error) {
    console.error("Error fetching transactions:", error.response ? error.response.data : error.message);
    res.status(500).json({ error: "Error fetching transactions" });
  }
});

// Check account balance
router.get('/balance/:accountId', async (req, res) => {
  const { accountId } = req.params;
  const balanceUrl = `${baseUrl}/accounts/${accountId}?key=${apiKey}`;

  try {
    const response = await axios.get(balanceUrl);
    const balance = response.data.balance;
    res.json({ accountId, balance });
  } catch (error) {
    console.error("Error fetching balance:", error.response ? error.response.data : error.message);
    res.status(500).json({ error: "Error fetching balance" });
  }
});

module.exports = router;
