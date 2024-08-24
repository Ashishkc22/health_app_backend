const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  device_id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
  },
  image: {
    type: String,
  },
  email: {
    type: String,
  },
  address: {
    type: String,
  },
  state: {
    type: String,
  },
  district: {
    type: String,
  },
  id_proof: {
    type: Object,
  },
  blood_group: {
    type: String,
  },
  dob: {
    type: String,
  },
  emergency_contact: {
    type: String,
  },
  team_leader_id: {
    type: String,
  },
  team_leader_name: {
    type: String,
  },
  created_at: {
    type: Number,
  },
  uid: {
    type: String,
  },
  role: {
    type: String,
    default: "FE",
  },
  status: {
    type: String,
    default: "Unverified",
    required: true,
  },
  current_state: {
    type: String,
  },
  current_district: {
    type: String,
  },
  current_location_type: {
    type: String,
  },
  current_janpad: {
    type: String,
  },
  current_gram_panchayat: {
    type: String,
  },
  current_tehsil: {
    type: String,
  },
  current_pincode: {
    type: String,
  },
  current_maplink: {
    type: String,
  },
  score: {
    type: Number,
    default: 0,
  },
  p2_count: {
    type: Number,
    default: 0,
  },
  p_count: {
    type: Number,
    default: 0,
  },
  d_count: {
    type: Number,
    default: 0,
  },
  ud_count: {
    type: Number,
    default: 0,
  },
  dis_count: {
    type: Number,
    default: 0,
  },
  reprint_count: {
    type: Number,
    default: 0,
  },
  RTO_count: {
    type: Number,
    default: 0,
  },
  ratio: {
    type: Number,
  },
  last_fetch: {
    type: Number,
  },
  reject_reason: {
    type: String,
  },
  tl_id: {
    type: String,
  },
  lat: {
    type: Number,
  },
  lon: {
    type: Number,
  },
  suspension_reason: {
    type: String,
  },
});

module.exports = mongoose.model("User", userSchema);
