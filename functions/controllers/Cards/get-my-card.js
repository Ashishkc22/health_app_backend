const {
 getCardById
} = require("../../processors");
const { CustomError } = require("../../utils/custom-errors");
const { ErrorEnums } = require("../../Enums");

async function getMyCard(req, res,next) {
  try {

    const card = await getCardById({userId: req.userDetails.id});
    if (card == null) {
     throw new CustomError(ErrorEnums.CARD_NOT_FOUND);
    }

    res.status(200).json({
      status: "success",
      data: card
    });
  } catch (error) {
   next(error);
  }
}

module.exports = getMyCard;
