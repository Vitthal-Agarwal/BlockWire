// const axios = require("axios");
// const apiKey = process.env.API_KEY;

// // Function to create an account with Capital One
// async function createAccountForCustomer(customerId, accountData) {
//   const url = `http://api.nessieisreal.com/customers/${customerId}/accounts?key=${apiKey}`;

//   const payload = {
//     type: accountData.type,
//     nickname: accountData.nickname,
//     rewards: accountData.rewards || 0,
//     balance: accountData.balance || 0,
//   };

//   try {
//     const response = await axios.post(url, payload, {
//       headers: {
//         "Content-Type": "application/json",
//       },
//     });

//     // Log the entire response to inspect its structure
//     console.log("Full Account API Response:", response);
    
//     if (response.status >= 200 && response.status < 300) {
//       // Log the specific part of the response you're trying to access
//       console.log("Account API Response Data:", response.data);
//       return response.data;  // Assuming `response.data` contains the necessary information
//     } else {
//       throw new Error("Capital One: Account creation failed with status " + response.status);
//     }
//   } catch (error) {
//     console.error("Error creating account:", error.response ? error.response.data : error.message);
//     throw new Error("Error creating account");
//   }
// }

// module.exports = {
//   createAccountForCustomer,
// };
