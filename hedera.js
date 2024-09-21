const { Client, PrivateKey, AccountId, TransferTransaction, Hbar } = require("@hashgraph/sdk");

const client = Client.forTestnet();
client.setOperator(AccountId.fromString(process.env.MY_ACCOUNT_ID), PrivateKey.fromString(process.env.MY_PRIVATE_KEY));

// Log customer creation to the Hedera blockchain
async function logCustomerCreation(customerId) {
    const transaction = new TransferTransaction()
        .addHbarTransfer(client.operatorAccountId, new Hbar(0.001)) // Logging fee
        .addHbarTransfer(AccountId.fromString(customerId), new Hbar(0));

    const receipt = await transaction.execute(client);
    console.log(`Customer creation logged on blockchain: ${receipt.transactionId}`);
}

// Log account creation to the Hedera blockchain
async function logAccountCreation(accountId) {
    const transaction = new TransferTransaction()
        .addHbarTransfer(client.operatorAccountId, new Hbar(0.001)) // Logging fee
        .addHbarTransfer(AccountId.fromString(accountId), new Hbar(0));

    const receipt = await transaction.execute(client);
    console.log(`Account creation logged on blockchain: ${receipt.transactionId}`);
}

// Log money transfer to the Hedera blockchain
async function logTransaction(senderId, recipientId, amount) {
    const transaction = new TransferTransaction()
        .addHbarTransfer(AccountId.fromString(senderId), new Hbar(-amount))
        .addHbarTransfer(AccountId.fromString(recipientId), new Hbar(amount));

    const receipt = await transaction.execute(client);
    console.log(`Transaction logged on blockchain: ${receipt.transactionId}`);
}

module.exports = { logCustomerCreation, logAccountCreation, logTransaction };
