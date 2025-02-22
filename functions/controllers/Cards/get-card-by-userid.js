const { cardSchema } = require("../../models");
const { Types } = require("mongoose");

async function getCardByUserId(req, res, next) {
  try {
    const card = await cardSchema.findOne({
      userId: Types.ObjectId(req.query.id),
    });
    if (card == null) {
      return res.status(200).json({
        status: "failed",
        message: "Card not found!",
      });
    }
    res.status(200).json({
      status: "success",
      data: card,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = getCardByUserId;
