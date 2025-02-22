const mongoose = require("mongoose");

const PincodeSchema = new mongoose.Schema({
  City: {
    type: String,
    required: true,
    trim: true,
  },
  Area: {
    type: String,
    required: true,
    trim: true,
  },
  Pincode: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: (value) => /^\d{6}$/.test(value), // Validate 6-digit pincode
      message: "Invalid Pincode. Must be 6 digits.",
    },
  },
  District: {
    type: String,
    required: true,
    trim: true,
  },
  State: {
    type: String,
    required: true,
    trim: true,
  },
});

module.exports = mongoose.model("Pincode", PincodeSchema);
