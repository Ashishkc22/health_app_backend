const mongoose = require("mongoose");

// This schema hold data about default permissions for each roles.
const configSchema = new mongoose.Schema({
  service: { type: String, required: true },
  role: { type: String, required: true },
  permissions: [{ type: String }],
});

module.exports = configSchema;
