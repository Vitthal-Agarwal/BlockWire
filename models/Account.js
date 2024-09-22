const mongoose = require('mongoose');

const AccountSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  capitalOneAccountId: { type: String, required: true }, // Capital One Account ID
  type: { type: String, required: true },
  nickname: { type: String, required: true },
  balance: { type: Number, required: true, default: 0 },
  rewards: { type: Number, required: true, default: 0 },
  hederaAccountId: { type: String, required: true },
  hederaPrivateKey: { type: String, required: true },
});

module.exports = mongoose.model('Account', AccountSchema);
