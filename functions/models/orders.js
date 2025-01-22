const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    orderId: {
      type: String,
      unique: true,
    },
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    razorpayOrderId: {
      type: String,
      required: true,
      unique: true,
    },
    razorpayPaymentId: {
      type: String,
      sparse: true,
      unique: true,
    },
    razorpaySignature: {
      type: String,
      sparse: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    amountInPaise: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
      default: "INR",
    },
    status: {
      type: String,
      enum: ["created", "attempted", "paid", "failed", "expired"],
      default: "created",
    },
    receipt: {
      type: String,
    },
    notes: {
      type: mongoose.Schema.Types.Mixed,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    paymentCapture: {
      type: Boolean,
      default: true,
    },
    expiredAt: {
      type: Date,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    error: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    collection: "orders",
  }
);

// Indexes for better query performance
orderSchema.index({ razorpayOrderId: 1 });
orderSchema.index({ razorpayPaymentId: 1 });
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });

// Generate unique order ID
orderSchema.pre("save", async function (next) {
  if (!this.orderId) {
    const date = new Date();
    const prefix =
      date.getFullYear().toString().substr(-2) +
      (date.getMonth() + 1).toString().padStart(2, "0");
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    this.orderId = `RZP${prefix}${random}`;
  }
  if (this.amount) {
    this.amountInPaise = this.amount * 100;
  }
  next();
});
// Array of all update operations to watch
const updateOperations = [
  "updateOne",
  "updateMany",
  "findOneAndUpdate",
  "findByIdAndUpdate",
  "update",
];
// Apply middleware to all update operations
updateOperations.forEach((operation) => {
  orderSchema.pre(operation, function (next) {
    this.set({ updatedAt: new Date() });
    next();
  });
});

module.exports = mongoose.model("orders", orderSchema);
