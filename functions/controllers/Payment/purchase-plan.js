const { logger } = require("../../utils/logger");
const { createPaymentOrder } = require("../../processors");
const { getPlanById } = require("../../processors");
const { ErrorEnums, TransactionEnums } = require("../../Enums");
const { isEmpty } = require("lodash");
const mongoose = require("mongoose");

async function createOrder(req, res, next) {
  try {
    const { planId, notes } = req.body;
    const deviceDetails = {
      deviceInfo: req.headers["user-agent"],
      ipAddress: req.ip || req.connection.remoteAddress,
      location: req.headers["x-forwarded-for"] || req.connection.remoteAddress,
      additionalMetadata: {
        name: req.userDetails?.name,
        email: req.userDetails?.email,
        phone: req.userDetails?.phone,
      },
    };
    const userDetails = req.userDetails;
    const plan = await getPlanById(planId);
    const orderDetails = await createPaymentOrder({
      amount: plan.price.amount,
      userDetails,
      planId: plan._id,
      notes,
      deviceDetails,
      transactionDetails: {
        senderId: userDetails.id,
        type: TransactionEnums.TRANSACTION_TYPE.PAYMENT,
        transferType: TransactionEnums.TRANSFER_TYPE.PLAN_PURCHASE,
        description: "Payment for plan purchase",
        recipientId: plan.recipientDetails.id,
      },
    });
    if (
      isEmpty(orderDetails) ||
      isEmpty(orderDetails.razorpayOrder) ||
      isEmpty(orderDetails.transaction)
    ) {
      throw new CustomError(ErrorEnums.FAILED_TO_CREATE_ORDER);
    }
    orderDetails.razorpayOrder.keyId = process.env.RAZORPAY_KEY_ID;
    orderDetails.razorpayOrder.transactionId = orderDetails.transaction.id;
    orderDetails.razorpayOrder.transactionReference =
      orderDetails.transaction.reference;
    return res.status(200).json({
      status: "success",
      data: orderDetails.razorpayOrder,
    });
  } catch (error) {
    logger.error("Error in creating order");
    next(error);
  }
}

module.exports = createOrder;
