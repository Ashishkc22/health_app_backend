module.exports = {
  USERS: {
    GET_USER_ERROR: {
      name: "GET_USER_BY_ID_ERROR",
      httpCode: 501,
      description: "Failed to get user by id.",
    },
  },
  RESET_PASSWORD: {
    MISSING_EMAIL: {
      name: "MISSING_EMAIL",
      httpCode: 502,
      description: "Failed to get user email.",
    },
  },
  INVALID_ADDRESS_TYPE: {
    name: "INVALID_ADDRESS_TYPE",
    httpCode: 503,
    description: "Got invalid address type.",
  },
  PLAN_NOT_FOUND: {
    name: "PLAN_NOT_FOUND",
    httpCode: 404,
    description: "Plan not found.",
  },
  RAZORPAY_ORDER_CREATION_FAILED: {
    name: "RAZORPAY_ORDER_CREATION_FAILED",
    httpCode: 504,
    description: "Razorpay order creation failed.",
  },
  SENDER_ID_REQUIRED: {
    name: "SENDER_ID_REQUIRED",
    httpCode: 505,
    description: "Sender ID is required.",
  },
  TRANSACTION_TYPE_REQUIRED: {
    name: "TRANSACTION_TYPE_REQUIRED",
    httpCode: 506,
    description: "Transaction type is required.",
  },
  AMOUNT_REQUIRED: {
    name: "AMOUNT_REQUIRED",
    httpCode: 507,
    description: "Amount is required.",
  },
  TRANSFER_TYPE_REQUIRED: {
    name: "TRANSFER_TYPE_REQUIRED",
    httpCode: 508,
    description: "Transfer type is required.",
  },
  DESCRIPTION_REQUIRED: {
    name: "DESCRIPTION_REQUIRED",
    httpCode: 509,
    description: "Description is required.",
  },
  TRANSACTION_NOT_FOUND: {
    name: "TRANSACTION_NOT_FOUND",
    httpCode: 510,
    description: "Transaction not found.",
  },
  TRANSACTION_ID_OR_ORDER_ID_REQUIRED: {
    name: "TRANSACTION_ID_OR_ORDER_ID_REQUIRED",
    httpCode: 511,
    description: "Transaction ID or Order ID is required.",
  },
  ORDER_NOT_FOUND: {
    name: "ORDER_NOT_FOUND",
    httpCode: 512,
    description: "Order not found.",
  },
  FAILED_TO_ADD_PURCHASE_PLAN_DETAILS: {
    name: "FAILED_TO_ADD_PURCHASE_PLAN_DETAILS",
    httpCode: 513,
    description: "Failed to add purchase plan details.",
  },
  PURCHASED_PLAN_NOT_FOUND: {
    name: "PURCHASED_PLAN_NOT_FOUND",
    httpCode: 514,
    description: "Purchased plan not found.",
  },
};
