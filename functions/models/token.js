const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema({
  token: {
    type: String,
  },
  uid: {
    type: String,
  },
  userAgent: {
    type: String,
  },
  clientIp: {
    type: String,
  },
});

module.exports = mongoose.model("Tokens", tokenSchema);
