const { cardSchema } = require("../models");
const { DBEnums } = require("../Enums");

async function getCardsByIds({ ids = [], project = { _id: 1, name: 1 } } = {}) {
  try {
    return await cardSchema
      .find({
        _id: { $in: ids },
        status: { $ne: DBEnums.CARD_STATUS.SUBMITTED },
      })
      .select(project);
  } catch (error) {
    console.error("Get cards by ids processor Failed", error.message);
    throw error;
  }
}

module.exports = getCardsByIds;
