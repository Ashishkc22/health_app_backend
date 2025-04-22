const { default: mongoose } = require("mongoose");
const { cardSchema, userSchema } = require("../models");
const { CustomError } = require("../utils/custom-errors");
const { ProcessorErrors, ErrorEnums } = require("../Enums");

const increaseMapper = {
  SUBMITTED: {
    p2_count: 1,
    score: 1,
  },
  PRINTED: {
    p_count: 1,
    score: 1,
  },
  DELIVERED: {
    d_count: 1,
    score: 1,
  },
  UNDELIVERED: { ud_count: 1, score: 1 },
  DISCARDED: { dis_count: 1, p2_count: -1 },
  RTO: { RTO_count: 1 },
  RECEIVED: { RECEIVE_count: 1 },
  REPRINT: { reprint_count: 1 },
};
async function updateCardStatus({
  id = "",
  status = "",
  discard_reason = "",
  userDetails = {},
}) {
  let session;
  try {
    session = await mongoose.startSession();
    session.startTransaction();
    const updatedCards = await cardSchema.findOneAndUpdate(
      { _id: mongoose.Types.ObjectId(id) },
      {
        $set: {
          status,
          ...(discard_reason && { discard_reason }),
          status_updated_at: new Date(),
        },
        $push: {
          status_history: {
            updated_status: status,
            created_at: new Date().valueOf(),
            updated_by: {
              name: userDetails.name,
              phone: userDetails.phone,
              _id: userDetails.id,
              uid: userDetails.uid,
            },
          },
        },
      },
      { new: true, session }
    );
    if (!updatedCards.created_by) {
      throw new CustomError(ErrorEnums.USER_ID_NOT_FOUND_IN_CARD_DETAILS);
    }
    await userSchema.updateOne(
      { _id: mongoose.Types.ObjectId(updatedCards.created_by) },
      increaseMapper[status],
      { session }
    );
    await session.commitTransaction();
    return updatedCards;
  } catch (error) {
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }
    throw error;
  }
}

module.exports = updateCardStatus;
