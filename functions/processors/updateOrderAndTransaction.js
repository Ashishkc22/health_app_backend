const { logger } = require("../utils/logger");
const { CustomError } = require("../utils/custom-errors");
const { ProcessorErrors, TransactionEnums } = require("../Enums");
const { orderSchema, transactionSchema } = require("../models");
const createTransaction = require("./createTransaction");

/**
 * Updates order and transaction documents using a MongoDB session for atomicity
 * @param {string} orderId - Order ID to update
 * @param {string} transactionId - Transaction ID to update
 * @param {Object} orderUpdate - Fields to update in order document
 * @param {Object} transactionUpdate - Fields to update in transaction document
 * @returns {Promise<{order: Object, transaction: Object}>} Updated order and transaction documents
 */
async function updateOrderAndTransaction({
  orderId,
  transactionId,
  orderUpdate,
  transactionUpdate,
  successCallback = async () => {},
}) {
  const session = await orderSchema.startSession();

  try {
    if (!transactionId || !orderId) {
      throw new CustomError(
        ProcessorErrors.TRANSACTION_ID_OR_ORDER_ID_REQUIRED
      );
    }

    session.startTransaction();

    // Update order document
    const order = await orderSchema.findByIdAndUpdate(orderId, orderUpdate, {
      new: true,
      session,
    });

    if (!order) {
      await session.abortTransaction();
      throw new CustomError(ProcessorErrors.ORDER_NOT_FOUND);
    }

    // Update transaction document
    const transaction = await transactionSchema.findByIdAndUpdate(
      transactionId,
      transactionUpdate,
      { new: true, session }
    );

    if (!transaction) {
      await session.abortTransaction();
      throw new CustomError(ProcessorErrors.TRANSACTION_NOT_FOUND);
    }

    const transactionData = transaction?.toJSON();

    // Create recipient transaction using createTransaction processor
    const recipientTransaction = await createTransaction({
      ...transactionData,
      type: TransactionEnums.TRANSACTION_TYPE.CREDIT,
      status: TransactionEnums.STATUS.COMPLETED,
      metadata: {
        ...transactionData.metadata,
        source: TransactionEnums.METADATA.source.SYSTEM,
      },
      session,
    });

    if (!recipientTransaction) {
      await session.abortTransaction();
      throw new CustomError(ProcessorErrors.TRANSACTION_NOT_FOUND);
    }

    await successCallback({ session,order })

    await session.commitTransaction();

    return {
      order,
      transaction,
    };
  } catch (error) {
    await session.abortTransaction();
    logger.error("Error updating order and transaction:", error);
    throw error;
  } finally {
    session.endSession();
  }
}

module.exports = updateOrderAndTransaction;
