const { cardSchema } = require("../../models");

async function getCardById(req, res) {
  let card;
  try {
    card = await cardSchema.findById(req.query.id);
    if (card == null) {
      return res.status(200).json({
        status: "failed",
        message: "Card not found!",
      });
    }
    card.address = `${card.area}, ${card.tehsil}, ${card.district}, ${card.state}`;
    res.card = card;
    res.status(200).json({
      status: "success",
      data: card,
    });
  } catch (err) {
    return res.status(200).json({
      status: "failed",
      message: err.message,
    });
  }
}

module.exports = getCardById;
