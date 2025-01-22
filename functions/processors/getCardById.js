const mongoose = require("mongoose");
const { cardSchema } = require("../models");

async function getCardById({ id = "", uuId = "",adhaarValue = "",userId= "" } = {}) {
  try {
    return await cardSchema.findOne({
      ...(id && { _id: mongoose.Types.ObjectId(id) }),
      ...(userId && { userId: mongoose.Types.ObjectId(userId) }),
      ...(uuId && { unique_number: uuId }),
      ...(adhaarValue && { "id_proof.value": adhaarValue }),
    });
  } catch (error) {
    console.error("Get cards processord Failed", error.message);
    throw error;
  }
}

module.exports = getCardById;
