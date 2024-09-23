const mongoose = require("mongoose");

const binSchema = new mongoose.Schema({}, { strict: false });

module.exports = mongoose.model("Bin", binSchema);
