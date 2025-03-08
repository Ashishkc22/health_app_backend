const { DBEnums } = require("../../Enums");
const { cardSchema } = require("../../models"); // Adjust the path as necessary

const getCardsCount = async (req, res, next) => {
  try {
    const totalCardCount = await cardSchema.countDocuments();
    const toBePrintedCount = await cardSchema.countDocuments({
      status: DBEnums.CARD_STATUS.SUBMITTED,
    });
    res
      .status(200)
      .json({ status: "success", data: { totalCardCount, toBePrintedCount } });
  } catch (error) {
    next(error);
  }
};

module.exports = getCardsCount;
