const mongoose = require("mongoose");

const RolesSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    decription: { type: String },
    permissions: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Roles", RolesSchema);
