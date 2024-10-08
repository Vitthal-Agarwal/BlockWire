import React, { useState } from "react";
import axios from "axios";

function App() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [streetNumber, setStreetNumber] = useState(""); // New state for street number
  const [streetName, setStreetName] = useState("");     // New state for street name
  const [city, setCity] = useState("");                 // New state for city
  const [state, setState] = useState("");               // New state for state
  const [zip, setZip] = useState("");                   // New state for zip code

  const [customerId, setCustomerId] = useState("");
  const [accountId, setAccountId] = useState("");
  const [recipientAccountId, setRecipientAccountId] = useState("");
  const [transferAmount, setTransferAmount] = useState(""); // Fixed reference here
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Additional states for account creation
  const [type, setType] = useState(""); 
  const [nickname, setNickname] = useState(""); 
  const [balanceInput, setBalanceInput] = useState(""); 
  const [rewards, setRewards] = useState(""); 

  // Create a new customer
  const createCustomer = async () => {
    if (!firstName || !lastName || !streetNumber || !streetName || !city || !state || !zip) {
      alert("Please enter all required fields.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await axios.post("http://localhost:3000/create-customer", {
        first_name: firstName,
        last_name: lastName,
        street_number: streetNumber,
        street_name: streetName,
        city: city,
        state: state,
        zip: zip,
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
    if (!customerId || !type || !nickname) {
      alert("Customer ID, Account Type, and Nickname are required.");
      return;
    }
    setLoading(true);
    setError("");
    
    try {
      const response = await axios.post("http://localhost:3000/create-account", {
        customerId,
        type,
        nickname,
        balance: balanceInput,
        rewards
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
    if (!accountId || !recipientAccountId || !transferAmount || transferAmount <= 0) {
      alert("Please ensure all fields are filled out with valid data.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await axios.post("http://localhost:3000/transfer-money", {
        senderAccountId: accountId,
        recipientAccountId,
        amount: parseFloat(transferAmount),
      });
      alert(`Transferred $${transferAmount} successfully to recipient account ${recipientAccountId}.`);
      fetchTransactions();
      fetchBalance(accountId);
    } catch (error) {
      console.error("Error sending money:", error.response ? error.response.data : error.message);
      if (
        error.response &&
        error.response.data &&
        error.response.data.error === "Transaction cancelled due to suspicion"
      ) {
        alert(`Transaction cancelled: ${error.response.data.reason}`);
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
      // Assuming the AI feedback is included in each transaction object as 'isSuspicious'
      // and 'reason'
      
      // Update transactions state with AI feedback
      if (response.data.transfers) {
        const updatedTransactions = response.data.transfers.map(tx => ({
          ...tx,
          aiFeedback: tx.isSuspicious ? `Flagged as suspicious: ${tx.reason}` : "Not suspicious"
        }));
        
        setTransactions(updatedTransactions);
        
      } else {
        setTransactions([]);
      }
      
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
            style={{ marginRight: "10px",marginBottom: "10px", width: "45%" }}
        />
        <input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            style={{ marginRight: "10px",marginBottom: "10px", width: "45%" }}
        />
        <input
            type="text"
            placeholder="Street Number"
            value={streetNumber}
            onChange={(e) => setStreetNumber(e.target.value)}
            style={{ marginBottom: "10px", display: "block", width: "100%" }}
        />
        <input
            type="text"
            placeholder="Street Name"
            value={streetName}
            onChange={(e) => setStreetName(e.target.value)}
            style={{ marginBottom: "10px", display: "block", width: "100%" }}
        />
        <input
            type="text"
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            style={{ marginBottom: "10px", display: "block", width: "100%" }}
        />
        <input
            type="text"
            placeholder="State"
            value={state}
            onChange={(e) => setState(e.target.value)}
            style={{ marginBottom: "10px", display: "block", width: "100%" }}
        />
        <input
            type="text"
            placeholder="Zip"
            value={zip}
            onChange={(e) => setZip(e.target.value)}
            style={{ marginBottom: "10px", display: "block", width: "100%" }}
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
          style={{ marginBottom: "10px", display: "block", width: "100%" }}
        />
        <input
          type="text"
          placeholder="Account Type (e.g., Savings, Checking)"
          value={type}
          onChange={(e) => setType(e.target.value)}
          style={{ marginBottom: "10px", display: "block", width: "100%" }}
        />
        <input
          type="text"
          placeholder="Nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          style={{ marginBottom: "10px", display: "block", width: "100%" }}
        />
        <input
          type="number"
          placeholder="Balance (optional)"
          value={balanceInput}
          onChange={(e) => setBalanceInput(e.target.value)}
          style={{ marginBottom: "10px", display: "block", width: "100%" }}
        />
        <input
          type="number"
          placeholder="Rewards (optional)"
          value={rewards}
          onChange={(e) => setRewards(e.target.value)}
          style={{ marginBottom: "10px", display: "block", width: "100%" }}
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
          value={transferAmount}
          onChange={(e) => setTransferAmount(e.target.value)}
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
        {loading ? 'Fetching...' : 'Fetch Transactions'}
       </button>
       
       {transactions.length >0 && (
           <>
             {transactions.map((tx,index)=>(
                <li key={index}>
                   {tx.description}: ${tx.amount} - Status:{tx.status} 
                   - AI Feedback:{tx.aiFeedback}
                </li>
             ))}
           </>
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
