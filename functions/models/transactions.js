const mongoose = require("mongoose");
const { TransactionEnums } = require("../Enums");
const transactionSchema = new mongoose.Schema(
  {
    // Core transaction details
    senderWalletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Wallet",
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(TransactionEnums.TRANSACTION_TYPE),
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      default: "INR",
    },

    // P2P specific fields
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      sparse: true,
      index: true,
    },
    recipientWalletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Wallet",
      sparse: true,
    },
    transferType: {
      type: String,
      enum: Object.values(TransactionEnums.TRANSFER_TYPE),
      required: true,
    },

    // Status tracking
    status: {
      type: String,
      enum: Object.values(TransactionEnums.STATUS),
      default: "pending",
    },

    // Reference and tracking
    reference: {
      type: String,
      unique: true,
    },
    description: {
      type: String,
    },

    // Related documents
    orderId: {
      type: String,
      sparse: true,
      index: true,
    },
    razorpayOrderId: {
      type: String,
      sparse: true,
    },
    razorpayPaymentId: {
      type: String,
      sparse: true,
    },

    // Balance tracking
    balanceAfter: {
      type: Number,
    },
    balanceBefore: {
      type: Number,
    },

    // Additional metadata
    metadata: {
      source: {
        type: String,
        enum: Object.values(TransactionEnums.METADATA.source),
        required: true,
      },
      deviceInfo: String,
      ipAddress: String,
      location: String,
      remarks: String,
      additional: mongoose.Schema.Types.Mixed,
    },
    error: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
    collection: "transactions",
  }
);

// Indexes for better query performance
transactionSchema.index({ walletId: 1, createdAt: -1 });
transactionSchema.index({ reference: 1 }, { unique: true });
transactionSchema.index({ status: 1, createdAt: -1 });
transactionSchema.index({ type: 1, createdAt: -1 });
transactionSchema.index({ transferType: 1, createdAt: -1 });

// Generate unique reference number
transactionSchema.pre("save", async function (next) {
  if (!this.reference) {
    const date = new Date();
    const prefix =
      date.getFullYear().toString().substr(-2) +
      (date.getMonth() + 1).toString().padStart(2, "0");
    const random = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, "0");
    this.reference = `TXN${prefix}${random}`;
  }
  next();
});

module.exports = mongoose.model("Transactions", transactionSchema);
