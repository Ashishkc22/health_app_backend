const { planSchema } = require("../models");
const { logger } = require("../utils/logger");

/**
 * Fetches all plans from the Plan collection
 * @returns {Promise<Array>} Array of plan documents
 * @throws {Error} If error occurs while fetching plans
 */
async function getPlans() {
  try {
    return await planSchema.find().lean();
  } catch (error) {
    logger.error(`Processor Error fetching plans: ${error.message}`);
    throw error;
  }
}

module.exports = getPlans;
