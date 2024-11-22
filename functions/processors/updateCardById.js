const cardSch = require("../models/card.js");
async function updateCardById({ id, updatedData = {} } = {}) {
  try {
    if (!id) {
      throw new Error("Missing card Id.");
    }
    return await cardSch.findByIdAndUpdate(id, updatedData);
  } catch (error) {
    console.error("Failed in update card by id processor", error.message);
    throw error;
  }
}
module.exports = updateCardById;
