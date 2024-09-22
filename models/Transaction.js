const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  senderAccountId: { type: String, required: true },
  recipientAccountId: { type: String, required: true },
  amount: { type: Number, required: true },
  transactionDate: { type: Date, default: Date.now },
  status: { type: String, default: "pending" }, // 'pending', 'completed', 'failed', etc.
  description: { type: String, required: true },
  hederaStatus: { type: String }, // To store Hedera transaction status
  isSuspicious: { type: Boolean }, // New field
  reason: { type: String },        // New field
});

module.exports = mongoose.model("Transaction", TransactionSchema);
