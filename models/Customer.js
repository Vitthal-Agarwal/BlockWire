const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  address: {
    streetNumber: { type: String, required: true },
    streetName: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true },
  },
  customerId: { type: String, required: true }, // This should match the Capital One customerId
  hederaAccountId: { type: String, required: true },
  hederaPrivateKey: { type: String, required: true },
});

module.exports = mongoose.model('Customer', CustomerSchema);
