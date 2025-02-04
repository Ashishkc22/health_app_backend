const { ErrorEnums, CustomError } = require("../../utils/custom-errors");
const { DBEnums, TransactionEnums } = require("../../Enums");
const {
  getUser,
  updateWallet,
  getWalletDetails,
  createTransaction,
} = require("../../processors");
const mongoose = require("mongoose");

const transferCoins = async (req, res, next) => {
  try {
    const { recipientId, amount } = req.body;
    const { id, role } = req.userDetails;
    if (role !== DBEnums.USER_ROLES.TL) {
      throw new CustomError(ErrorEnums.UNAUTHORIZED);
    }
    const senderWallet = await getWalletDetails({
      userId: id,
      status: DBEnums.WALLET_STATUS.ACTIVE,
    });
    const recipient = await getUser({ id: recipientId });
    if (!senderWallet) {
      throw new CustomError(ErrorEnums.WALLET_DOES_NOT_EXIST);
    }
    if (!recipient) {
      return next(new CustomError(ErrorEnums.USER_NOT_FOUND));
    }
    if (senderWallet.balance < amount) {
      return next(new CustomError(ErrorEnums.INSUFFICIENT_BALANCE));
    }
    const session = await mongoose.startSession();
    try {
      session.startTransaction();

      // Get wallet details before update for balance tracking
      const senderBalanceBefore = senderWallet.balance;
      const recipientWallet = await getWalletDetails({
        userId: recipientId,
        status: DBEnums.WALLET_STATUS.ACTIVE,
      });
      const recipientBalanceBefore = recipientWallet
        ? recipientWallet.balance
        : 0;

      // Update wallets
      const senderUpdate = await updateWallet({
        userId: id,
        amount: -amount,
        session,
      });
      const recipientUpdate = await updateWallet({
        userId: recipientId,
        amount: amount,
        session,
        updateData: { userId: recipient._id },
        upsert: true,
      });

      // Create transaction for sender
      await createTransaction(
        {
          senderId: id,
          senderWalletId:senderWallet._id,
          recipientWalletId: recipientWallet?._id,
          recipientId: recipientId,
          type: TransactionEnums.TRANSACTION_TYPE.P2P_SENT,
          transferType: TransactionEnums.TRANSFER_TYPE.P2P_TRANSFER,
          amount: amount,
          description: `P2P coin transfer to ${
            recipient.name || recipient._id
          }`,
          status: "completed",
          balanceBefore: senderBalanceBefore,
          balanceAfter: senderBalanceBefore - amount,
          metadata: {
            source: TransactionEnums.METADATA.source.MOBILE,
            remarks: "Peer-to-peer coin transfer",
          },
        },
        session
      );

      // Create transaction for recipient
      await createTransaction(
        {
          senderId: id,
          recipientId: recipientId,
          senderWalletId:senderWallet._id,
          recipientWalletId: recipientWallet?._id,
          type: TransactionEnums.TRANSACTION_TYPE.P2P_RECEIVED,
          transferType: TransactionEnums.TRANSFER_TYPE.P2P_TRANSFER,
          amount: amount,
          description: `P2P coin received from ${req.userDetails.name || id}`,
          status: "completed",
          balanceBefore: recipientBalanceBefore,
          balanceAfter: recipientBalanceBefore + amount,
          metadata: {
            source: TransactionEnums.METADATA.source.sYSTEM,
            remarks: "Peer-to-peer coin received",
          },
        },
        session
      );

      await session.commitTransaction();
      session.endSession();
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
    return res.status(200).json({
      status: "success",
      message: "Coins transferred successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = transferCoins;
