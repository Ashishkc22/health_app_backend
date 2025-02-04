const { logger } = require("../utils/logger");
const razorpayInstance = require("../config.js/razorPay.config");
const mongoose = require("mongoose");
const { orderSchema } = require("../models");
const { PaymentEnums, ProcessorErrors, TransactionEnums } = require("../Enums");
const { CustomError } = require("../utils/custom-errors");
const createTransaction = require("./createTransaction");

async function createPaymentOrder({
  amount,
  currency = PaymentEnums.currency.INR,
  notes,
  userDetails,
  deviceDetails = {},
  planId,
  plan = {},
  transactionDetails = {},
}) {
  let razorpayOrder;
  let session;
  const tranactionParams = {
    ...(transactionDetails.senderWalletId && {
      senderWalletId: transactionDetails.senderWalletId,
    }),
    senderId: transactionDetails.senderId,
    type: transactionDetails.type,
    transferType: transactionDetails.transferType,
    description: transactionDetails.description,
    recipientId: transactionDetails.recipientId,
    ...(transactionDetails.recipientWalletId && {
      recipientWalletId: transactionDetails.recipientWalletId,
    }),
    metadata: {
      source: transactionDetails?.metadata?.source || TransactionEnums.METADATA.source.WEB,
      ...(deviceDetails?.deviceInfo && {
        deviceInfo: deviceDetails.deviceInfo,
      }),
      ...(deviceDetails?.ipAddress && {
        ipAddress: deviceDetails.ipAddress,
      }),
      ...(deviceDetails?.location && { location: deviceDetails.location }),
      ...(deviceDetails?.remarks && { remarks: deviceDetails.remarks }),
      ...(deviceDetails?.additionalMetadata && {
        additional: deviceDetails.additionalMetadata,
      }),
    },
  };
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    try {
      razorpayOrder = await razorpayInstance.orders.create({
        amount: amount * 100,
        currency,
        notes,
      });
    } catch (razorpayError) {
      logger.error("Razorpay order creation failed:", razorpayError);

     const transactionDetails = await createTransaction(
        {
          amount: amount,
          orderId: orderDetails.id,
          ...tranactionParams,
          status: TransactionEnums.STATUS.FAILED,
        },
        session
      );

      const failedOrder = new orderSchema({
        amount,
        currency,
        notes,
     ... (plan && { plan }),
        status: PaymentEnums.orderStatus.FAILED,
        userId: userDetails.id,
        amountInPaise: amount * 100,
        planId,
        error: razorpayError,
        transactionId: transactionDetails.id
      });

      await failedOrder.save({ session });
      await session.commitTransaction();
      throw new CustomError(ProcessorErrors.RAZORPAY_ORDER_CREATION_FAILED);
    }

    const orderDetails = new orderSchema({
      amount,
      currency,
      notes,
     ... (plan && { plan }),
      status: PaymentEnums.orderStatus.CREATED,
      userId: userDetails.id,
      razorpayOrderId: razorpayOrder.id,
      amountInPaise: amount * 100,
      receipt: razorpayOrder.receipt,
      attempts: razorpayOrder.attempts || 0,
      expiredAt: razorpayOrder.expired_at,
      planId,
    });

    const transaction = await createTransaction(
      {
        amount: amount,
        orderId: orderDetails.id,
        razorpayOrderId: razorpayOrder.id,
        ...tranactionParams,
      },
      session
    );

    orderDetails.transactionId = transaction._id;

    await orderDetails.save({ session });
    await session.commitTransaction();

    return { razorpayOrder, transaction };
  } catch (error) {
    if (session) {
      await session.abortTransaction();
    }
    logger.error("Error in creating payment order:", error);
    throw error;
  } finally {
    if (session) {
      await session.endSession();
    }
  }
}

module.exports = createPaymentOrder;
