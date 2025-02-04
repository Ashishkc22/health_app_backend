const { walletSchema } = require("../models");

async function getWalletDetails({ userId, status }) {
  try {
    const wallet = await walletSchema.findOne({
      userId,
      status: status,
    });
    return wallet;
  } catch (error) {
    throw error;
  }
}

module.exports = getWalletDetails ;
