const mongoose = require("mongoose");

const ServiceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    clientId: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Services", ServiceSchema);
