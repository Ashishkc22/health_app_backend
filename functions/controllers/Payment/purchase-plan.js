const { logger } = require("../../utils/logger");
const {
  createPaymentOrder,
  getPurchaedPlanDetails,
  updatePurchasedPlanDetails,
  getUser,
} = require("../../processors");
const { getPlanById } = require("../../processors");
const { ErrorEnums, TransactionEnums, DBEnums } = require("../../Enums");
const { isEmpty } = require("lodash");
const moment = require("moment");
const { CustomError } = require("../../utils/custom-errors");
const mongoose = require("mongoose");

async function createOrder(req, res, next) {
  try {
    const {
      planId,
      description = "Payment for plan purchase",
      notes,
      isPlanRenew = false,
      isCoinPurchase = false,
      amount,
    } = req.body;

    const { id, role } = req.userDetails;

    if (isCoinPurchase && role !== DBEnums.USER_ROLES.TL) {
      throw new CustomError(ErrorEnums.UNAUTHORIZED);
    }
    let purchasedPlan = {};
    if (!isCoinPurchase) {
      purchasedPlan = await getPurchaedPlanDetails({
        userId: mongoose.Types.ObjectId(id),
        planId: mongoose.Types.ObjectId(planId),
        ...(!isPlanRenew && { status: DBEnums.PLAN_STATUS.ACTIVE }),
      },false);
      if (isPlanRenew) {
        if (!purchasedPlan) {
          throw new CustomError(ErrorEnums.PLAN_DOES_NOT_EXIST);
        } else {
          if (purchasedPlan.endDate) {
            const current = moment();
            const secondary = moment(purchasedPlan.endDate);
            if (!secondary.isBefore(current)) {
              throw new CustomError(ErrorEnums.PLAN_ALREADY_ACTIVE);
            } else {
              await updatePurchasedPlanDetails({
                userId: purchasedPlan.userId,
                planId: purchasedPlan.planId,
                updateData: {
                  status: DBEnums.PLAN_STATUS.INACTIVE,
                },
              });
            }
          } else if (!purchasedPlan.renewal.isRenewable) {
            throw new CustomError(ErrorEnums.PLAN_NOT_RENEWABLE);
          }
        }
      } else if (purchasedPlan) {
        throw new CustomError(ErrorEnums.PLAN_ALREADY_ACTIVE);
      }
    }

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
    let plan = {};
    if (!isCoinPurchase) {
      plan = await getPlanById(planId);
    }

    const orderPayload = {};
    let transactionDetails = {};
    if (isCoinPurchase) {
      const adminUser = await getUser({
        searchOptions: {
          role: DBEnums.USER_ROLES.ADMIN,
          status: DBEnums.USER_STATUS.Verified,
        },
        projection: {
          _id: 1,
        },
      });
      orderPayload.amount = amount;
      transactionDetails = {
        senderId: userDetails.id,
        type: TransactionEnums.TRANSACTION_TYPE.PAYMENT,
        transferType: TransactionEnums.TRANSFER_TYPE.COIN_PURCHASE,
        description,
        recipientId: adminUser._id,
        metadata: {
          source: TransactionEnums.METADATA.source.MOBILE,
        },
      };
    } else {
      orderPayload.amount = isPlanRenew
        ? plan.renewal.price
        : plan.price.amount;
      orderPayload.planId = plan._id;
      orderPayload.plan = { isRenew: isPlanRenew, isPurchase: !isPlanRenew };
      transactionDetails = {
        senderId: userDetails.id,
        type: TransactionEnums.TRANSACTION_TYPE.PAYMENT,
        transferType: isPlanRenew
          ? TransactionEnums.TRANSFER_TYPE.PLAN_RENEW
          : TransactionEnums.TRANSFER_TYPE.PLAN_PURCHASE,
        description,
        recipientId: plan.recipientDetails.id,
      };
    }

    const orderDetails = await createPaymentOrder({
      ...orderPayload,
      userDetails,
      notes,
      deviceDetails,
      transactionDetails,
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
