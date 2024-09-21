import React, { useState } from "react";
import axios from "axios";

function App() {
    // State management for user input
    const [firstName, setFirstName] = useState(""); 
    const [lastName, setLastName] = useState("");   
    const [customerId, setCustomerId] = useState(""); 
    const [accountId, setAccountId] = useState(""); 
    const [recipientAccountId, setRecipientAccountId] = useState(""); 
    const [amount, setAmount] = useState(""); 
    const [transactions, setTransactions] = useState([]); 

    // Create a new customer
    const createCustomer = async () => {
        if (!firstName || !lastName) {
            alert("Please enter both first name and last name.");
            return;
        }

        try {
            const response = await axios.post("http://localhost:3000/create-customer", {
                first_name: firstName,
                last_name: lastName,
            });
            setCustomerId(response.data.customerId);
            alert(`Customer ${firstName} ${lastName} created successfully.`);
        } catch (error) {
            console.error("Error creating customer:", error.response ? error.response.data : error.message);
            alert("Error creating customer");
        }
    };

    // Create an account for the customer
    const createAccount = async () => {
        if (!customerId) {
            alert("Customer ID is required to create an account.");
            return;
        }

        try {
            const response = await axios.post("http://localhost:3000/create-account", {
                customerId,
                accountType: "Savings",
                nickname: "My Savings Account",
                balance: 1000,
                rewards: 200,
            });
            setAccountId(response.data.accountId);
            alert("Account created successfully.");
        } catch (error) {
            console.error("Error creating account:", error.response ? error.response.data : error.message);
            alert("Error creating account");
        }
    };

    // Transfer money between accounts
    const transferMoney = async () => {
        if (!accountId || !recipientAccountId || !amount) {
            alert("Please ensure all fields are filled out.");
            return;
        }

        try {
            const response = await axios.post("http://localhost:3000/transfer-money", {
                senderAccountId: accountId,
                recipientAccountId,
                amount: parseFloat(amount)
            });
            alert(`Transferred $${amount} successfully to recipient account ${recipientAccountId}.`);
        } catch (error) {
            console.error("Error sending money:", error.response ? error.response.data : error.message);
            alert("Error sending money");
        }
    };

    // Fetch transactions for the recipient account
    const fetchTransactions = async () => {
        if (!recipientAccountId) {
            alert("Recipient Account ID is required to fetch transactions.");
            return;
        }

        try {
            const response = await axios.get(`http://localhost:3000/transactions/${recipientAccountId}`);
            setTransactions(response.data);
        } catch (error) {
            console.error("Error fetching transactions:", error.response ? error.response.data : error.message);
            alert("Error fetching transactions");
        }
    };

    return (
        <div className="App">
            <h1>Capital One Financial Transactions</h1>

            {/* Create a Customer Section */}
            <div>
                <h3>Create a New Customer</h3>
                <input
                    type="text"
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                />
                <button onClick={createCustomer}>Create Customer</button>
            </div>

            {/* Create Account Section */}
            {customerId && (
                <div>
                    <h3>Create an Account for Customer ID: {customerId}</h3>
                    <button onClick={createAccount}>Create Account</button>
                </div>
            )}

            {/* Transfer Money Section */}
            {accountId && (
                <div>
                    <h3>Send Money from Account ID: {accountId}</h3>
                    <input
                        type="text"
                        placeholder="Recipient Account ID"
                        value={recipientAccountId}
                        onChange={(e) => setRecipientAccountId(e.target.value)}
                    />
                    <input
                        type="number"
                        placeholder="Amount to Send"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />
                    <button onClick={transferMoney}>Send Money</button>
                </div>
            )}

            {/* Fetch Transactions Section */}
            <div>
                <h3>Recipient's Transactions</h3>
                <input
                    type="text"
                    placeholder="Recipient Account ID"
                    value={recipientAccountId}
                    onChange={(e) => setRecipientAccountId(e.target.value)}
                />
                <button onClick={fetchTransactions}>Get Transactions</button>

                {transactions.length > 0 && (
                    <ul>
                        {transactions.map((transaction) => (
                            <li key={transaction._id}>
                                {transaction.description}: ${transaction.amount}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default App;
