const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: true,
    },
    balance: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      default: "INR",
    },
    status: {
      type: String,
      enum: ["active", "inactive", "frozen"],
      default: "active",
    },
  },
  {
    timestamps: true,
    collection: "wallets",
  }
);

// Add indexes for better query performance
walletSchema.index({ userId: 1 });

// Add a method to check if wallet has sufficient funds
walletSchema.methods.hasSufficientFunds = function (amount) {
  return this.balance >= amount;
};

module.exports = mongoose.model("Wallet", walletSchema);
