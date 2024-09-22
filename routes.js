require("dotenv").config();

const express = require('express');
const axios = require("axios");

const router = express.Router();
const apiKey = process.env.API_KEY;
const baseUrl = `http://api.nessieisreal.com`;

// Import Hedera functions
const { createHederaAccount, transferHbar } = require('./hedera');

// In-memory data storage for demonstration purposes
const customers = [];
const accounts = [];

// Create a new customer
router.post('/create-customer', async (req, res) => {
  const customerUrl = `${baseUrl}/customers?key=${apiKey}`;

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
    console.log("Customer API Response:", response.data);

    if (response.data && response.data.objectCreated) {
      const customerId = response.data.objectCreated._id;

      // Create Hedera account for customer
      const hederaAccount = await createHederaAccount();

      // Store customer data, including Hedera account details
      const newCustomer = {
        customerId,
        firstName: req.body.first_name,
        lastName: req.body.last_name,
        hederaAccountId: hederaAccount.accountId,
        hederaPrivateKey: hederaAccount.privateKey,
      };

      customers.push(newCustomer);

      res.json({ customerId, hederaAccountId: hederaAccount.accountId });
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

    const accountId = response?.objectCreated?._id;

    if (!accountId) {
      throw new Error("Account ID is undefined in the API response");
    }

    // Create Hedera account for the bank account
    const hederaAccount = await createHederaAccount();

    // Store account data, including Hedera account details
    const newAccount = {
      customerId,
      accountId,
      type,
      nickname,
      balance: parseFloat(balance) || 0,
      rewards: parseFloat(rewards) || 0,
      hederaAccountId: hederaAccount.accountId,
      hederaPrivateKey: hederaAccount.privateKey,
    };

    accounts.push(newAccount);

    res.json({ accountId, hederaAccountId: hederaAccount.accountId });
  } catch (error) {
    console.error("Error creating account:", error.response ? error.response.data : error.message);
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

  // Define the transfer date in the required format (e.g., "2024-09-22")
  const transactionDate = new Date().toISOString().split('T')[0];  // Gets today's date in YYYY-MM-DD format

  const transferUrl = `${baseUrl}/accounts/${senderAccountId}/transfers?key=${apiKey}`;
  const accountUrl = `${baseUrl}/accounts/${senderAccountId}?key=${apiKey}`;

  try {
    // Step 1: Fetch sender's account balance
    const accountResponse = await axios.get(accountUrl);
    const senderBalance = parseFloat(accountResponse.data.balance);

    // Step 2: Check if sender has enough funds
    if (senderBalance < amount) {
      return res.status(400).json({ error: "Insufficient funds" });
    }

    // Step 3: Proceed with transfer if enough funds are available
    const transferData = {
      "medium": "balance",
      "payee_id": recipientAccountId,
      "amount": amount,
      "transaction_date": transactionDate,  // Add the transaction date
      "status": "pending",  // Set status as "pending" by default
      "description": "Transfer to recipient"
    };

    const response = await axios.post(transferUrl, transferData);
    console.log("Transfer API Response:", response.data);

    // Step 4: Perform the transfer on Hedera blockchain
    const senderAccount = accounts.find(acc => acc.accountId === senderAccountId);
    const recipientAccount = accounts.find(acc => acc.accountId === recipientAccountId);

    if (!senderAccount || !recipientAccount) {
      return res.status(404).json({ error: "Sender or recipient account not found" });
    }

    const hederaStatus = await transferHbar(
      senderAccount.hederaAccountId,
      senderAccount.hederaPrivateKey,
      recipientAccount.hederaAccountId,
      amount
    );

    console.log("Hedera Transfer Status:", hederaStatus);

    // Update balances in the in-memory data (for demonstration)
    senderAccount.balance -= amount;
    recipientAccount.balance += amount;

    res.json({ message: "Transfer successful", transaction: response.data, hederaStatus });
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
