const { servicesSchema } = require("../models");

async function getServiceByName({ name = "" }) {
  try {
    return await servicesSchema.findOne({ name: name });
  } catch (error) {
    throw error;
  }
}

module.exports = getServiceByName;
