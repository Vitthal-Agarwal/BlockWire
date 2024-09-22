import React, { useState } from "react";
import axios from "axios";

function App() {
  // State to store dynamic user input
  const [firstName, setFirstName] = useState(""); // New state for first name
  const [lastName, setLastName] = useState(""); // New state for last name
  const [customerId, setCustomerId] = useState(""); // Customer ID after creation
  const [accountId, setAccountId] = useState(""); // Account ID after creation
  const [recipientAccountId, setRecipientAccountId] = useState(""); // Recipient's account ID for money transfer
  const [amount, setAmount] = useState(""); // Amount for transfer
  const [transactions, setTransactions] = useState([]); // Transaction history
  const [balance, setBalance] = useState(null); // Account balance
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(""); // Error message

  // Create a new customer
  const createCustomer = async () => {
    if (!firstName || !lastName) {
      alert("Please enter both first name and last name.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await axios.post("http://localhost:3000/create-customer", {
        first_name: firstName,
        last_name: lastName,
      });
      setCustomerId(response.data.customerId);
      alert(`Customer ${firstName} ${lastName} created successfully.`);
    } catch (error) {
      console.error("Error creating customer:", error.response ? error.response.data : error.message);
      setError("Error creating customer");
      alert("Error creating customer");
    }
    setLoading(false);
  };

  // Create an account for the customer
  const createAccount = async () => {
    if (!customerId) {
      alert("Customer ID is required to create an account.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await axios.post("http://localhost:3000/create-account", {
        customerId,
      });
      setAccountId(response.data.accountId);
      alert("Account created successfully.");
    } catch (error) {
      console.error("Error creating account:", error.response ? error.response.data : error.message);
      setError("Error creating account");
      alert("Error creating account");
    }
    setLoading(false);
  };

  // Transfer money to the recipient
  const transferMoney = async () => {
    if (!accountId || !recipientAccountId || !amount || amount <= 0) {
      alert("Please ensure all fields are filled out with valid data.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await axios.post("http://localhost:3000/transfer-money", {
        senderAccountId: accountId,
        recipientAccountId,
        amount: parseFloat(amount),
      });
      alert(`Transferred $${amount} successfully to recipient account ${recipientAccountId}.`);
      // Fetch updated transactions
      fetchTransactions();
      // Optionally, fetch updated balance
      fetchBalance(accountId);
    } catch (error) {
      console.error("Error sending money:", error.response ? error.response.data : error.message);
      if (error.response && error.response.data && error.response.data.error === "Insufficient funds") {
        alert("Transfer failed: Insufficient funds.");
      } else {
        alert("Error sending money");
      }
      setError("Error sending money");
    }
    setLoading(false);
  };

  // Fetch transactions for the recipient account
  const fetchTransactions = async () => {
    if (!recipientAccountId) {
      alert("Recipient Account ID is required to fetch transactions.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(`http://localhost:3000/transactions/${recipientAccountId}`);
      setTransactions(response.data.transfers || []);
    } catch (error) {
      console.error("Error fetching transactions:", error.response ? error.response.data : error.message);
      setError("Error fetching transactions");
      alert("Error fetching transactions");
    }
    setLoading(false);
  };

  // Fetch account balance
  const fetchBalance = async (accountIdToCheck) => {
    if (!accountIdToCheck) {
      alert("Account ID is required to fetch balance.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(`http://localhost:3000/balance/${accountIdToCheck}`);
      setBalance(response.data.balance);
    } catch (error) {
      console.error("Error fetching balance:", error.response ? error.response.data : error.message);
      setError("Error fetching balance");
      alert("Error fetching balance");
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
      <h1>Capital One Financial Transactions</h1>

      <section style={{ marginBottom: "20px" }}>
        <h2>Create Customer</h2>
        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          style={{ marginRight: "10px", width: "45%" }}
        />
        <input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          style={{ marginRight: "10px", width: "45%" }}
        />
        <button onClick={createCustomer} disabled={loading}>
          {loading ? "Creating..." : "Create Customer"}
        </button>
      </section>

      <section style={{ marginBottom: "20px" }}>
        <h2>Create Account</h2>
        <input
          type="text"
          placeholder="Customer ID"
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
          style={{ marginRight: "10px", width: "60%" }}
        />
        <button onClick={createAccount} disabled={loading}>
          {loading ? "Creating..." : "Create Account"}
        </button>
      </section>

      <section style={{ marginBottom: "20px" }}>
        <h2>Transfer Money</h2>
        <input
          type="text"
          placeholder="Sender Account ID"
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
          style={{ marginBottom: "10px", display: "block", width: "100%" }}
        />
        <input
          type="text"
          placeholder="Recipient Account ID"
          value={recipientAccountId}
          onChange={(e) => setRecipientAccountId(e.target.value)}
          style={{ marginBottom: "10px", display: "block", width: "100%" }}
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{ marginBottom: "10px", display: "block", width: "100%" }}
        />
        <button onClick={transferMoney} disabled={loading}>
          {loading ? "Transferring..." : "Send Transaction"}
        </button>
      </section>

      <section style={{ marginBottom: "20px" }}>
        <h2>Transaction History</h2>
        <input
          type="text"
          placeholder="Recipient Account ID"
          value={recipientAccountId}
          onChange={(e) => setRecipientAccountId(e.target.value)}
          style={{ marginBottom: "10px", display: "block", width: "100%" }}
        />
        <button onClick={fetchTransactions} disabled={loading}>
          {loading ? "Fetching..." : "Fetch Transactions"}
        </button>
        {transactions.length > 0 && (
          <ul>
            {transactions.map((tx, index) => (
              <li key={index}>
                {tx.description}: ${tx.amount} - Status: {tx.status}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section style={{ marginBottom: "20px" }}>
        <h2>Check Account Balance</h2>
        <input
          type="text"
          placeholder="Account ID"
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
          style={{ marginBottom: "10px", display: "block", width: "100%" }}
        />
        <button onClick={() => fetchBalance(accountId)} disabled={loading}>
          {loading ? "Fetching..." : "Check Balance"}
        </button>
        {balance !== null && (
          <p>
            <strong>Balance:</strong> ${balance}
          </p>
        )}
      </section>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default App;