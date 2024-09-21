import React, { useState } from "react";
import axios from "axios";

function App() {
    const [userType, setUserType] = useState(""); // enterprise or customer
    const [customerId, setCustomerId] = useState("");
    const [accountId, setAccountId] = useState("");
    const [recipientAccountId, setRecipientAccountId] = useState("");
    const [amount, setAmount] = useState("");
    const [transactions, setTransactions] = useState([]);
    const [customers, setCustomers] = useState([]); // For enterprise

    // User selection
    const handleUserTypeSelect = (type) => {
        setUserType(type);
    };

    // Create a new customer (for Enterprise)
    const createCustomer = async () => {
        try {
            const response = await axios.post("http://localhost:3000/create-customer", {
                first_name: "John",
                last_name: "Doe"
            });
            setCustomerId(response.data.customerId);
            alert("Customer created successfully.");
        } catch (error) {
            console.error("Error creating customer:", error.response ? error.response.data : error.message);
            alert("Error creating customer");
        }
    };

    // Create an account for the customer (for Customer)
    const createAccount = async () => {
        if (!customerId) {
            alert("Customer ID is required to create an account.");
            return;
        }

        try {
            const response = await axios.post("http://localhost:3000/create-account", {
                customerId
            });
            setAccountId(response.data.accountId);
            alert("Account created successfully.");
        } catch (error) {
            console.error("Error creating account:", error.response ? error.response.data : error.message);
            alert("Error creating account");
        }
    };

    // Transfer money (for Customer)
    const transferMoney = async () => {
        if (!accountId || !recipientAccountId || !amount) {
            alert("Please ensure all fields are filled out.");
            return;
        }

        try {
            await axios.post("http://localhost:3000/transfer-money", {
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

    // Fetch transactions for customer (for Customer)
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

    // Fetch all customers for Enterprise
    const fetchAllCustomers = async () => {
        try {
            const response = await axios.get("http://localhost:3000/customers");
            setCustomers(response.data);
        } catch (error) {
            console.error("Error fetching customers:", error.response ? error.response.data : error.message);
            alert("Error fetching customers");
        }
    };

    return (
        <div className="App">
            {/* Select User Type */}
            <div>
                <h2>Select User Type</h2>
                <button onClick={() => handleUserTypeSelect("enterprise")}>Enterprise</button>
                <button onClick={() => handleUserTypeSelect("customer")}>Customer</button>
            </div>

            {/* Enterprise Interface */}
            {userType === "enterprise" && (
                <div>
                    <h1>Enterprise Dashboard</h1>
                    <button onClick={createCustomer}>Create Customer</button>
                    <button onClick={fetchAllCustomers}>View All Customers</button>

                    {customers.length > 0 && (
                        <ul>
                            {customers.map((customer) => (
                                <li key={customer._id}>
                                    {customer.first_name} {customer.last_name} - Account ID: {customer.account_id}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {/* Customer Interface */}
            {userType === "customer" && (
                <div>
                    <h1>Customer Dashboard</h1>
                    {customerId && (
                        <div>
                            <h3>Create an Account for Customer ID: {customerId}</h3>
                            <button onClick={createAccount}>Create Account</button>
                        </div>
                    )}

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
            )}
        </div>
    );
}

export default App;
