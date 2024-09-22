require("dotenv").config();

const {
  Client,
  PrivateKey,
  AccountCreateTransaction,
  Hbar,
  TransferTransaction,
  AccountId,
} = require("@hashgraph/sdk");

// Initialize Hedera Client for Testnet
const myAccountId = process.env.MY_ACCOUNT_ID;
const myPrivateKey = process.env.MY_PRIVATE_KEY;

if (!myAccountId || !myPrivateKey) {
  throw new Error("Environment variables MY_ACCOUNT_ID and MY_PRIVATE_KEY must be set.");
}

const client = Client.forTestnet();
client.setOperator(AccountId.fromString(myAccountId), PrivateKey.fromString(myPrivateKey));

/**
 * Creates a new Hedera account with an initial balance.
 * @param {number} initialBalance - Initial Hbar balance for the new account.
 * @returns {Promise<{ accountId: string, privateKey: string }>}
 */
async function createHederaAccount(initialBalance = 10) {
  // Generate new key pair
  const newPrivateKey = PrivateKey.generate();
  const newPublicKey = newPrivateKey.publicKey;

  // Create the new account
  const accountCreateTx = new AccountCreateTransaction()
    .setKey(newPublicKey)
    .setInitialBalance(new Hbar(initialBalance));

  // Sign the transaction with the operator key and submit
  const accountCreateSubmit = await accountCreateTx.execute(client);

  // Get the receipt
  const accountCreateRx = await accountCreateSubmit.getReceipt(client);

  // Get the new account ID
  const newAccountId = accountCreateRx.accountId;

  console.log(`Created new Hedera account with ID: ${newAccountId}`);

  return {
    accountId: newAccountId.toString(),
    privateKey: newPrivateKey.toString(),
  };
}

/**
 * Transfers Hbars between two Hedera accounts.
 * @param {string} senderId - Sender's Hedera account ID.
 * @param {string} senderPrivateKey - Sender's Hedera private key.
 * @param {string} recipientId - Recipient's Hedera account ID.
 * @param {number} amount - Amount of Hbars to transfer.
 * @returns {Promise<string>} - Transaction status.
 */
async function transferHbar(senderId, senderPrivateKey, recipientId, amount) {
  // Create transfer transaction
  const transferTx = new TransferTransaction()
    .addHbarTransfer(AccountId.fromString(senderId), new Hbar(-amount))
    .addHbarTransfer(AccountId.fromString(recipientId), new Hbar(amount));

  // Sign the transaction with the sender's private key
  const senderKey = PrivateKey.fromString(senderPrivateKey);
  const signedTx = await transferTx.freezeWith(client).sign(senderKey);

  // Submit the transaction
  const txResponse = await signedTx.execute(client);

  // Get the receipt
  const receipt = await txResponse.getReceipt(client);

  console.log(`Transfer transaction status: ${receipt.status}`);

  return receipt.status.toString();
}

module.exports = {
  createHederaAccount,
  transferHbar,
};
