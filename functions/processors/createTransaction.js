const { logger } = require("../utils/logger");
const mongoose = require("mongoose");
const { transactionSchema } = require("../models");
const { CustomError } = require("../utils/custom-errors");
const { ProcessorErrors } = require("../Enums");
/**
 * Creates a new transaction record
 * @param {Object} transactionData Transaction details
 * @param {mongoose.ClientSession} [session] Mongoose session for transactions
 * @returns {Promise<Object>} Created transaction document
 */
async function createTransaction(transactionData, session) {
  try {
    // Validate required fields
    if (!transactionData.senderId)
      throw new CustomError(ProcessorErrors.SENDER_ID_REQUIRED);
    if (!transactionData.type)
      throw new CustomError(ProcessorErrors.TRANSACTION_TYPE_REQUIRED);
    if (!transactionData.amount)
      throw new CustomError(ProcessorErrors.AMOUNT_REQUIRED);
    if (!transactionData.transferType)
      throw new CustomError(ProcessorErrors.TRANSFER_TYPE_REQUIRED);
    if (!transactionData.description)
      throw new CustomError(ProcessorErrors.DESCRIPTION_REQUIRED);

    // Build transaction object using spread operator for conditional fields
    const transactionObj = {
      senderWalletId: transactionData.senderWalletId,
      ...(transactionData.transactionId && {
        transactionId: transactionData.transactionId,
      }),
      senderId: transactionData.senderId,
      type: transactionData.type,
      amount: transactionData.amount,
      transferType: transactionData.transferType,
      description: transactionData.description,
      currency: transactionData.currency || "INR",
      status: transactionData.status || "pending",
      ...(transactionData.razorpayOrderId && {
        razorpayOrderId: transactionData.razorpayOrderId,
      }),
      ...(transactionData.recipientId && {
        recipientId: transactionData.recipientId,
      }),
      ...(transactionData.recipientWalletId && {
        recipientWalletId: transactionData.recipientWalletId,
      }),
      ...(transactionData.orderId && { orderId: transactionData.orderId }),
      ...(transactionData.razorpayPaymentId && {
        razorpayPaymentId: transactionData.razorpayPaymentId,
      }),
      ...(typeof transactionData.balanceAfter !== "undefined" && {
        balanceAfter: transactionData.balanceAfter,
      }),
      ...(typeof transactionData.balanceBefore !== "undefined" && {
        balanceBefore: transactionData.balanceBefore,
      }),
      metadata: {
        source: transactionData.metadata.source || "system",
        ...(transactionData.metadata.deviceInfo && {
          deviceInfo: transactionData.metadata.deviceInfo,
        }),
        ...(transactionData.metadata.ipAddress && {
          ipAddress: transactionData.metadata.ipAddress,
        }),
        ...(transactionData.metadata.location && {
          location: transactionData.metadata.location,
        }),
        ...(transactionData.metadata.remarks && {
          remarks: transactionData.metadata.remarks,
        }),
        ...(transactionData.metadata.additionalMetadata && {
          additional: transactionData.metadata.additionalMetadata,
        }),
      },
    };

    const transaction = new transactionSchema(transactionObj);
    await transaction.save(session && { session });

    return transaction;
  } catch (error) {
    logger.error("Error creating transaction:", error);
    throw error;
  }
}

module.exports = createTransaction;
