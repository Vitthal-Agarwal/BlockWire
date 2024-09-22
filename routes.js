require("dotenv").config();

const express = require('express');
const axios = require("axios");

const router = express.Router(); // Router for handling routes

const apiKey = process.env.API_KEY;
const baseUrl = `http://api.nessieisreal.com`;

// Create a new customer
router.post('/create-customer', async (req, res) => {
  const customerUrl = `${baseUrl}/customers?key=${apiKey}`;
  const customerData = {
    "first_name": req.body.first_name,
    "last_name": req.body.last_name,
    "address": {
      "street_number": "123",
      "street_name": "Main St",
      "city": "Somewhere",
      "state": "CA",
      "zip": "12345"
    }
  };

  try {
    const response = await axios.post(customerUrl, customerData);
    console.log("Customer API Response:", response.data); // Log response
    const customerId = response.data.objectCreated._id;
    res.json({ customerId });
  } catch (error) {
    console.error("Error creating customer:", error.response ? error.response.data : error.message); // Log error
    res.status(500).json({ error: "Error creating customer" });
  }
});

// Create an account for a customer
router.post('/create-account', async (req, res) => {
  const { customerId } = req.body;
  const accountUrl = `${baseUrl}/customers/${customerId}/accounts?key=${apiKey}`;
  const accountData = {
    "type": "Savings",
    "nickname": req.body.nickname || "Savings Account",
    "rewards": 100,
    "balance": 1000
  };

  try {
    const response = await axios.post(accountUrl, accountData);
    console.log("Account API Response:", response.data); // Log response
    const accountId = response.data.objectCreated._id;
    res.json({ accountId });
  } catch (error) {
    console.error("Error creating account:", error.response ? error.response.data : error.message); // Log error
    res.status(500).json({ error: "Error creating account" });
  }
});

// Transfer money between accounts
router.post('/transfer-money', async (req, res) => {
  const { senderAccountId, recipientAccountId, amount } = req.body;

  // Validate input
  if (!senderAccountId || !recipientAccountId || !amount || amount <= 0) {
    return res.status(400).json({ error: "Invalid input. Please provide valid senderAccountId, recipientAccountId, and a positive amount." });
  }

  const transferUrl = `${baseUrl}/accounts/${senderAccountId}/transfers?key=${apiKey}`;
  const accountUrl = `${baseUrl}/accounts/${senderAccountId}?key=${apiKey}`; // Endpoint to get account details

  try {
    // Step 1: Fetch sender's account balance
    const accountResponse = await axios.get(accountUrl);
    const senderBalance = accountResponse.data.balance;

    // Step 2: Check if sender has enough funds
    if (senderBalance < amount) {
      return res.status(400).json({ error: "Insufficient funds" });
    }

    // Step 3: Proceed with transfer if enough funds are available
    const transferData = {
      "medium": "balance",
      "payee_id": recipientAccountId,
      "amount": amount,
      "description": "Transfer to recipient"
    };

    const response = await axios.post(transferUrl, transferData);
    console.log("Transfer API Response:", response.data); // Log response

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