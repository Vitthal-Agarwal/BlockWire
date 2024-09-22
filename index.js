require("dotenv").config();
const express = require('express');
const axios = require("axios");

const app = express();
app.use(express.json());

const apiKey = process.env.API_KEY;
const baseUrl = `http://api.nessieisreal.com`;

// Create a new customer
const createCustomer = async (req, res) => {
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
        const customerId = response.data.objectCreated._id;
        res.json({ customerId });
    } catch (error) {
        console.error("Error creating customer:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: "Error creating customer" });
    }
};

// Create an account for a customer
const createAccount = async (req, res) => {
    const { customerId } = req.body;

    const accountData = {
        "type": "Savings",
        "nickname": req.body.nickname || "Savings Account",
        "rewards": 100,
        "balance": 1000
    };

    try {
        const response = await axios.post(accountUrl, accountData);
        const accountId = response.data.objectCreated._id;
        res.json({ accountId });
    } catch (error) {
        console.error("Error creating account:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: "Error creating account" });
    }
};

// Transfer money between accounts
const transferMoney = async (req, res) => {
    const { senderAccountId, recipientAccountId, amount } = req.body;
    const transferUrl = `${baseUrl}/accounts/${senderAccountId}/transfers?key=${apiKey}`;

    const transferData = {
        "medium": "balance",
        "payee_id": recipientAccountId,
        "amount": amount,
        "transaction_date": Date.now(),
        "description": "Transfer to recipient"
    };

    try {
        const response = await axios.post(transferUrl, transferData);
        res.json({ message: "Transfer successful", transaction: response.data });
    } catch (error) {
        console.error("Error transferring money:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: "Error transferring money" });
    }
};

// Fetch transactions for an account
const getTransactions = async (req, res) => {
    const { accountId } = req.params;
    const transactionUrl = `${baseUrl}/accounts/${accountId}/transfers?key=${apiKey}`;

    try {
        const response = await axios.get(transactionUrl);
        res.json(response.data);
    } catch (error) {
        console.error("Error fetching transactions:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: "Error fetching transactions" });
    }
};

// Expose backend endpoints for frontend interactions
app.post('/create-customer', createCustomer);
app.post('/create-account', createAccount);
app.post('/transfer-money', transferMoney);
app.get('/transactions/:accountId', getTransactions);

// Start the server
app.listen(3000, () => {
    console.log("Backend server is running on http://localhost:3000");
});
