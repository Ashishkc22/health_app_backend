const mongoose = require("mongoose");
const { cardSchema } = require("../models");

async function getCardById({ id = "", uuId = "", project = {} } = {}) {
  try {
    return await cardSchema.findOne({
      ...(id && { _id: mongoose.Types.ObjectId(id) }),
      ...(uuId && { unique_number: uuId }),
    });
  } catch (error) {
    console.error("Get cards processord Failed", error.message);
    throw error;
  }
}

module.exports = getCardById;
