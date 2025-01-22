const { logger } = require("../utils/logger");
const { CustomError } = require("../utils/custom-errors");
const { ProcessorErrors } = require("../Enums");
const { transactionSchema } = require("../models");

async function getTransactionByRazorpayOrderId(razorpayOrderId) {
  try {
    if (!razorpayOrderId) {
      throw new CustomError(ProcessorErrors.INVALID_ORDER_ID);
    }

    const transaction = await transactionSchema.findOne({
      razorpayOrderId: razorpayOrderId,
    });

    if (!transaction) {
      throw new CustomError(ProcessorErrors.TRANSACTION_NOT_FOUND);
    }

    return transaction;
  } catch (error) {
    logger.error(
      "Processor Error fetching transaction by razorpay order id:",
      error
    );
    throw error;
  }
}

module.exports = getTransactionByRazorpayOrderId;
