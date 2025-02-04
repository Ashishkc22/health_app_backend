const { walletSchema } = require("../models");

async function updateWallet({ userId, amount, session, updateData, upsert }) {
  try {
    const user = await walletSchema.findByIdAndUpdate(
      userId,
      {
        ...(amount && { $inc: { balance: amount } }),
        ...(updateData && { $set: updateData }),
      },
      { session, new: true, upsert }
    );
    return user;
  } catch (error) {
    throw error;
  }
}

module.exports = updateWallet;
