const mongoose = require('mongoose');

const dealSchema = new mongoose.Schema({
  from: String,
  to: String,
  weapon: String,
  year: Number,
  value: Number
});

module.exports = mongoose.model('Deal', dealSchema);