const { getCardsByIds, updateCardStatus } = require("../../processors");
const { userSchema, cardSchema } = require("../../models");

const markCardsAsPrinted = async (req, res) => {
  try {
    const tokenDetails = req.userDetails;
    const list = (req.body.uids || "").toString().split(",");

    const cardIds = await getCardsByIds({ ids: list });
    const existingCardIds = cardIds?.map((card) => card._id.toString()) || [];
    const nonExistingCardIds = list.filter(
      (id) => !existingCardIds.includes(id)
    );

    for (const cardId of nonExistingCardIds) {
      await updateCardStatus({
        id: cardId,
        status: "PRINTED",
        userDetails: tokenDetails,
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Card updated successfully",
      failedToUpdateCards: existingCardIds || [],
    });
  } catch (err) {
    return res.status(200).json({
      status: "failed",
      message: err.message,
    });
  }
};

module.exports = markCardsAsPrinted;
