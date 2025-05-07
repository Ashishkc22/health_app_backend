const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  phone: {
    type: String,
  },
  password: {
    type: String,
  },
  device_id: {
    type: String,
  },
  name: {
    type: String,
  },
  legalName: {
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
    type: mongoose.Schema.Types.ObjectId,
    ref: "State",
  },
  current_district: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "District",
  },
  current_janpad: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tehsil",
  },
  current_gram_panchayat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Area",
  },
  current_gram: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Gram",
  },
  current_tehsil: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "newtehsils",
  },
  current_location_type: {
    type: String,
  },
  current_city: {
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
  RECEIVE_count: {
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
  alternate_phone: {
    type: Number,
  },
  janPanchayat: {
    type: String,
  },
  gender: {
    type: String,
  },
  signatureImage: { type: String },
  passportImage: { type: String },
  registrationFormImage: { type: String },
  agreementImage: { type: String },
  panCardImage: { type: String },
  suspension_reason: {
    type: String,
  },
  services: [
    {
      serviceId: { type: mongoose.Schema.Types.ObjectId, required: true },
      roleId: { type: mongoose.Schema.Types.ObjectId, require: true },
    },
  ],
});

module.exports = mongoose.model("User", userSchema);
