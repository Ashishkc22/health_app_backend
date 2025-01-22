const { logger } = require("../../utils/logger");
const { PaymentEnums, ErrorEnums, TransactionEnums } = require("../../Enums");
const {
  getTransactionByRazorpayOrderId,
  updateOrderAndTransaction,
  getPlanById,
  addPurchasePlanDetails
} = require("../../processors");
const razorpay = require("razorpay");

async function successCallback({ session, order }) {
  try {
    const plan = await getPlanById(order.planId, {
      session,
      project: { _id: 1, membershipDetails: 1 },
    });
    const purchasedPlan = await addPurchasePlanDetails({
      userId: order.userId,
      planDetails: plan,
      transactionId: order.transactionId,
      amount: order.amount,
      currency: order.currency,
      session,
    });
    return purchasedPlan;
  } catch (error) {
    throw error;
  }
}

async function planCheckout(req, res, next) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const transactionDetails = await getTransactionByRazorpayOrderId(
      razorpay_order_id
    );

    if (transactionDetails.status === TransactionEnums.STATUS.COMPLETED) {
      return res.status(200).json({
        status: "success",
        message: "Payment already done.",
      });
    }

    if (razorpay_signature) {
      const generatedSignature = razorpay.validateWebhookSignature(
        razorpay_order_id + "|" + razorpay_payment_id,
        razorpay_signature,
        process.env.RAZORPAY_KEY_SECRET
      );

      if (!generatedSignature) {
        throw new CustomError(ErrorEnums.INVALID_SIGNATURE);
      }
    }

    await updateOrderAndTransaction({
      orderId: transactionDetails.orderId,
      transactionId: transactionDetails.id,
      orderUpdate: {
        status: PaymentEnums.orderStatus.PAID,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
      },
      transactionUpdate: {
        status: TransactionEnums.STATUS.COMPLETED,
        razorpayPaymentId: razorpay_payment_id,
      },
      successCallback,
    });
  } catch (error) {
    logger.error("Controller Error in plan checkout");
    next(error);
  }
}

module.exports = planCheckout;
