const mongoose = require("mongoose");
const {
  DBEnums: { PLAN_NAME, PLAN_TYPE },
} = require("../Enums");
const { duration } = require("moment/moment");
const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      enum: Object.values(PLAN_NAME),
      unique: true,
    },
    type: {
      type: String,
      required: true,
      enum: Object.values(PLAN_TYPE),
    },
    price: {
      amount: { type: Number, required: true },
      currency: { type: String, default: "INR" },
      // interval: { type: String, default: "year" },
      savings: { type: Number, default: 0 },
    },
    discounts: {
      value: { type: Number, default: 0 },
      type: { type: String, default: "percentage" }, // percentage or fixed
    },
    membershipDetails: {
      maxMembers: { type: Number, default: 1 }, // 1 for Solo, 2 for Couple, 4/6 for Family
      validityPeriod: {
        duration: { type: Number, default: 1 }, // in years
        type: { type: String, default: "year" }, // in years
        infinite: { type: Boolean, default: false },
      },
      // waitingPeriod: { type: Number, default: 0 }, // in days
      activationPeriod: { type: Number, default: 3 }, // in days
    },
    features: {
      priorityAppointment: { type: Boolean, default: false },
      ePHRFacility: { type: Boolean, default: false },
      bloodSampleCollectionAtHome: { type: Boolean, default: false },
      // annualHealthCheckup: { type: Boolean, default: false },
      // consultations: {
      //   specialist: {
      //     count: { type: Number, default: 0 },
      //     worth: { type: Number, default: 0 },
      //   },
      //   general: {
      //     count: { type: Number, default: 0 },
      //     worth: { type: Number, default: 0 },
      //   },
      // },
    },

    renewal: {
      price: { type: Number },
      isRenewable: { type: Boolean, default: false },
      // multiYearOptions: [
      //   {
      //     years: { type: Number },
      //     price: { type: Number },
      //   },
      // ],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    recipientDetails: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      name: { type: String },
      email: { type: String },
      phone: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("plan", planSchema);
