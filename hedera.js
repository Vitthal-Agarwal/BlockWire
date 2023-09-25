const {
  Client,
  PrivateKey,
  AccountCreateTransaction,
} = require("@hashgraph/sdk");

const myAccountId = process.env.MY_ACCOUNT_ID;
const myPrivateKey = PrivateKey.fromString(process.env.MY_PRIVATE_KEY);
const client = Client.forTestnet();
client.setOperator(myAccountId, myPrivateKey);

// Function to create an account with Hedera
async function createHederaAccount() {
  const newAccountPrivateKey = PrivateKey.generate();
  const newAccountPublicKey = newAccountPrivateKey.publicKey;

  const newAccount = await new AccountCreateTransaction()
    .setKey(newAccountPublicKey)
    .setInitialBalance(Hbar.fromTinybars(1000))
    .execute(client);

  const getReceipt = await newAccount.getReceipt(client);
  return getReceipt.accountId.toString();
}

module.exports = {
  createHederaAccount,
};
