const addRequestForPasswordReset = require("./addRequestForPasswordReset");
const addUser = require("./addUser");
const addUserRole = require("./addUserRole");
const getAddressByType = require("./getAddressByType");
const getCardById = require("./getCardById");
const getServiceByName = require("./getServiceByName");

module.exports = {
  getUser: require("./getUser"),
  getUsersRoleAndServiceDetails: require("./getUsersRoleAndServiceDetails"),
  getCardCount: require("./getCardCount"),
  getCards: require("./getCards"),
  updateCardById: require("./updateCardById"),
  updateUserById: require("./updateUserById"),
  addRequestForPasswordReset,
  getOTPToken: require("./getOTPToken"),
  updateUserByEmail: require("./updateUserByEmail"),
  addUserRole,
  addUser,
  getServiceByName,
  getAddressByType,
  getCardById,
  getCardsByIds: require("./getCardsByIds"),
  updateCardStatus: require("./updateCardStatus"),
  createPaymentOrder: require("./createPaymentOrder"),
  getPlans: require("./getPlans"),
  getPlanById: require("./getPlanById"),
  getTransactionByRazorpayOrderId: require("./getTransactionByRazorpayOrderId"),
  updateOrderAndTransaction: require("./updateOrderAndTransaction"),
  addPurchasePlanDetails: require("./addPurchasePlanDetails"),
  getPurchaedPlanDetails: require("./getPurchaedPlanDetails"),
  addCard: require("./addCard"),
};
