const userSch = require("../models/user");

async function updateUserById({ id, updatedData = {} } = {}) {
  try {
    if (!id) {
      throw new Error("Missing card Id.");
    }
    return await userSch.findByIdAndUpdate(userr._id, updatedData);
  } catch (error) {
    console.error("Failed in update user by id processor", error.message);
    throw error;
  }
}
module.exports = updateUserById;
