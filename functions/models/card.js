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
  pincode: {
    type: String,
  },
  city: {
    type: String,
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
  card_type: {
    type: String,
    required: true,
    enum: ["Single", "Family"],
    default: "Single",
  },
  family_members: [
    {
      name: String,
      gender: {
        type: String,
        enum: ["Male", "Female", "Transgender", "Other"],
      },
      birth_year: { type: String },
      relation: { type: String },
    },
  ],
  total_price_before_discount: Number,
  total_price_after_discount: Number,
  received_amount: Number,
  remaining_amount: Number,
  plan_validity: {
    value: Number,
    type: { type: String, enum: ["Yr"] },
  },
  selectedPlanId: { type: String },
  abha_id: {
    type: String,
    minlength: [14, "abha id must be 14 characters long"],
    maxLength: [14, "abha id must be 14 characters long"],
  },
  notes: String,
  pwd: Boolean,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
  },
});

module.exports = mongoose.model("Card", cardSchema);
