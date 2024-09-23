const mongoose = require("mongoose");

const hospitalSchema = new mongoose.Schema({
  state: {
    type: String,
    required: true,
  },
  district: {
    type: String,
    required: true,
  },
  category: {
    type: String,
  },
  entity_name: {
    type: String,
  },
  reg_no: {
    type: String,
  },
  established_in: {
    type: String,
  },
  doctors: {
    type: Array,
  },
  basic_facilities: {
    type: Array,
  },
  advance_facilities: {
    type: Array,
  },
  timings: {
    type: Array,
  },
  address: {
    type: String,
  },
  pincode: {
    type: String,
  },
  city: {
    type: String,
  },
  tel_no: {
    type: String,
  },
  mobile_no: {
    type: String,
  },
  email: {
    type: String,
  },
  website: {
    type: String,
  },
  hospital_rates: {
    type: Object,
  },
  discount_ipd: {
    type: Number,
  },
  discount_opd: {
    type: Number,
  },
  discount_medicine: {
    type: Number,
  },
  discount_diagnostic: {
    type: Number,
  },
  acknowledge: {
    type: String,
  },
  auth_sign: {
    type: String,
  },
  date_of_agreement: {
    type: String,
  },
  images: {
    type: Array,
  },
  created_by: {
    type: String,
  },
  created_by_name: {
    type: String,
  },
  created_by_uid: {
    type: String,
  },
  created_at: {
    type: Number,
  },
  start_time: {
    type: String,
  },
  close_time: {
    type: String,
  },
  map_link: {
    type: String,
  },
  status: {
    type: String,
    default: "ENABLE",
  },
  contactPersonName: { type: String },
  contactPersonPhone: { type: String },
  uid: {
    type: String,
  },
});

module.exports = mongoose.model("Hospital", hospitalSchema);
