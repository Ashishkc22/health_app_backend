const mongoose = require("mongoose");

const cardSchema = new mongoose.Schema({
  image: {
    type: String,
  },
  name: {
    type: String,
    required: true,
  },
  birth_year: {
    type: String,
  },
  gender: {
    type: String,
  },
  id_proof: {
    type: Object,
  },
  state: {
    type: String,
  },
  district: {
    type: String,
  },
  tehsil: {
    type: String,
  },
  area: {
    type: String,
  },
  address: {
    type: String,
  },
  phone: {
    type: String,
  },
  father_husband_name: {
    type: String,
  },
  blood_group: {
    type: String,
  },
  emergency_contact: {
    type: String,
  },
  status: {
    type: String,
    default: "SUBMITTED",
  },
  created_by: {
    type: String,
  },
  created_by_uid: {
    type: String,
  },
  created_at: {
    type: Number,
  },
  issue_date: {
    type: String,
  },
  unique_number: {
    type: String,
  },
  expiry: {
    type: String,
  },
  created_by_name: {
    type: String,
  },
  expiry_date: {
    type: Number,
  },
  expiry_years: {
    type: Number,
    default: 2,
  },
  discard_reason: {
    type: String,
  },
  s_no: {
    type: String,
  },
  status_history: {
    type: Array,
    default: [],
  },
  isPrintedPreviously: {
    type: Boolean,
  },
  status_updated_at: {
    type: Date,
  },
});

module.exports = mongoose.model("Card", cardSchema);
