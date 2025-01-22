module.exports = {
  ADD_ADDRESS_ERRORS: {
    addressType: {
      name: "ADDRESS-TYPE-ERROR",
      httpCode: 401,
      description: "Invalid address type.",
    },
  },
  PATH_NOT_FOUND: {
    name: "PATH-NOT-FOUND",
    httpCode: 402,
    description: "Request path not found.",
  },
  USER_NOT_FOUND: {
    name: "USER-NOT-FOUND",
    httpCode: 403,
    description: "User not found with provided information.",
  },
  INCORRECT_PASSWORD: {
    name: "INCORRECT-PASSWORD",
    httpCode: 404,
    description: "Incorrect password.",
  },
  FAILED_TO_SEND_EMAIL_OTP: {
    name: "SEND-OTP-EMAIL",
    httpCode: 405,
    description: "Failed to send otp.",
  },
  FAILED_TO_SEND_EMAIL: {
    name: "FAILED-TO-SEND-EMAIL",
    httpCode: 406,
    description: "Failed to send email.",
  },
  EXPIRED_OTP: {
    name: "EXPIRED-OTP",
    httpCode: 407,
    description: "Expired OTP.",
  },
  INVALID_OTP: {
    name: "INVALID-OTP",
    httpCode: 408,
    description: "Invalid OTP.",
  },
  FAILED_TO_GENERATE_OTP_ID: {
    name: "FAILED-TO-GENERATE-OTP-ID",
    httpCode: 409,
    description: "Failed to to generate token.",
  },
  INVALID_PASSWORD_RESET_TOKEN: {
    name: "INVALID-PASSWORD-RESET-TOKEN",
    httpCode: 410,
    description: "Invalid reset token.",
  },
  PASSWORD_RESET_TOKEN_EXPIRED: {
    name: "PASSWORD-RESET-TOKEN-EXPIRED",
    httpCode: 411,
    description: "Expired reset token.",
  },
  USER_ALREADY_EXISTS: {
    name: "USER-ALREADY-EXISTS",
    httpCode: 412,
    description: "User Already exists with this phone/email",
  },
  SERVICE_NOT_FOUND: {
    name: "SERVICE_NOT_FOUND",
    httpCode: 413,
    description: "Service not found",
  },
  AUTH_HEADER_MISSING: {
    name: "AUTH-HEADER-MISSING",
    httpCode: 414,
    description: "Missing auth token.",
  },
  INVALID_TOKEN: {
    name: "INVALID-TOKEN",
    httpCode: 415,
    description: "Invalid Auth token.",
  },
  USER_AUTH_DETAILS_NOT_FOUND: {
    name: "USER-AUTH-DETAILS-NOT-FOUND",
    httpCode: 416,
    description: "User auth details missing.",
  },
  ACCESS_DENIED: {
    name: "ACCESS-DENIED",
    httpCode: 417,
    description: "Access denied",
  },
  FAILED_TO_GET_USER_LIST: {
    name: "FAILED-TO-GET-USER-LIST",
    httpCode: 418,
    description: "Failed to get users.",
  },
  CARD_NOT_FOUND: {
    name: "CARD_NOT_FOUND",
    httpCode: 419,
    description: "Unable to find card with the specified ID.",
  },
  CARD_STATUS_CAN_NOT_BE_UPDATED: {
    name: "CARD-STATUS-CAN-NOT-BE-UPDATED",
    httpCode: 420,
    description: "Card status can not be updated.",
  },
  USER_ID_NOT_FOUND_IN_CARD_DETAILS: {
    name: "USER-ID-NOT-FOUND-IN-CARD-DETAILS",
    httpCode: 421,
    description: "User id not found in card details.",
  },
  NO_PLANS_FOUND: {
    name: "NO-PLANS-FOUND",
    httpCode: 422,
    description: "No plans found.",
  },
  FAILED_TO_CREATE_ORDER: {
    name: "FAILED-TO-CREATE-ORDER",
    httpCode: 423,
    description: "Failed to create order.",
  },
  INVALID_SIGNATURE: {
    name: "INVALID-SIGNATURE",
    httpCode: 424,
    description: "Invalid signature.",
  },
  FAILED_TO_CREATE_ROLE: {
    name: "FAILED-TO-CREATE-ROLE",
    httpCode: 425,
    description: "Failed to create role for google user..",
  },
  FAILED_TO_ADD_CARD: {
    name: "FAILED-TO-ADD-CARD",
    httpCode: 426,
    description: "Failed to add card.",
  },
  CARD_ALREADY_EXISTS: {
    name: "CARD-ALREADY-EXISTS",
    httpCode: 427,
    description: "Card already exists.",
  },
  NO_ACTIVE_PLAN_FOUND: {
    name: "NO-ACTIVE-PLAN-FOUND",
    httpCode: 428,
    description: "No active plan found.",
  },
};
