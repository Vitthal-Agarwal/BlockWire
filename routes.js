const express = require('express');
const axios = require("axios");
const hederaLogger = require("./hedera");

const router = express.Router();

const apiKey = process.env.API_KEY;
const baseUrl = `http://api.nessieisreal.com`;

// Create a new customer using Capital One API
router.post('/create-customer', async (req, res) => {
    const customerUrl = `${baseUrl}/customers?key=${apiKey}`;

    // Capture customer data sent from the frontend
    const customerData = {
        "first_name": req.body.first_name,  // <-- Dynamic first name
        "last_name": req.body.last_name,    // <-- Dynamic last name
        "address": {
            "street_number": "123",         // Placeholder data
            "street_name": "Main St",       // Placeholder data
            "city": "Somewhere",
            "state": "CA",
            "zip": "12345"
        }
    };

    try {
        // Send the dynamic data to the Capital One API
        const response = await axios.post(customerUrl, customerData);
        console.log("Customer API Response:", response.data);
        const customerId = response.data.objectCreated._id;
        res.json({ customerId });
    } catch (error) {
        console.error("Error creating customer:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: error.response ? error.response.data : error.message });
    }
});

// Create an account for a customer using the Capital One API
router.post('/create-account', async (req, res) => {
  const { customerId, accountType, nickname, balance, rewards } = req.body;
  const accountUrl = `${baseUrl}/customers/${customerId}/accounts?key=${apiKey}`;

  const accountData = {
      type: accountType,
      nickname: nickname,
      rewards: rewards,
      balance: balance
  };

  try {
      const response = await axios.post(accountUrl, accountData);
      const accountId = response.data.objectCreated._id;

      // Log the account creation on the Hedera blockchain
      await hederaLogger.logAccountCreation(accountId);

      res.json({ accountId });
  } catch (error) {
      console.error("Error creating account:", error.response ? error.response.data : error.message);
      res.status(500).json({ error: "Error creating account" });
  }
});

// Transfer money between accounts using the Capital One API
router.post('/transfer-money', async (req, res) => {
    const { senderAccountId, recipientAccountId, amount } = req.body;
    const senderUrl = `${baseUrl}/accounts/${senderAccountId}?key=${apiKey}`;
    const recipientUrl = `${baseUrl}/accounts/${recipientAccountId}?key=${apiKey}`;

    try {
        // Fetch balances to ensure validity
        const senderResponse = await axios.get(senderUrl);
        const recipientResponse = await axios.get(recipientUrl);
        const senderBalance = senderResponse.data.balance;

        if (senderBalance < amount) {
            return res.status(400).json({ error: "Insufficient funds" });
        }

        // Update balances
        await axios.put(senderUrl, { balance: senderBalance - amount });
        await axios.put(recipientUrl, { balance: recipientResponse.data.balance + amount });

        // Log the transaction on the blockchain
        await hederaLogger.logTransaction(senderAccountId, recipientAccountId, amount);

        res.json({ message: "Transfer successful" });
    } catch (error) {
        console.error("Error transferring money:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: "Error transferring money" });
    }
});

// Fetch transaction history for an account using Capital One API
router.get('/transactions/:accountId', async (req, res) => {
    const accountId = req.params.accountId;
    const transactionUrl = `${baseUrl}/accounts/${accountId}/transfers?key=${apiKey}`;

    try {
        const response = await axios.get(transactionUrl);
        res.json(response.data);
    } catch (error) {
        console.error("Error fetching transactions:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: "Error fetching transactions" });
    }
});

// Fetch all customers
router.get('/customers', async (req, res) => {
    const customerUrl = `${baseUrl}/customers?key=${apiKey}`;

    try {
        const response = await axios.get(customerUrl);
        res.json(response.data);
    } catch (error) {
        console.error("Error fetching customers:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: "Error fetching customers" });
    }
});

module.exports = router;
