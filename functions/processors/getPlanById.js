const Plan = require("../models/plans");
const { logger } = require("../utils/logger");
const { CustomError } = require("../utils/custom-errors");
const { PLAN_NOT_FOUND } = require("../Enums/ProcessorErrors");
/**
 * Fetches a plan by its ID from the Plan collection
 * @param {string} planId - The ID of the plan to fetch
 * @returns {Promise<Object>} The plan document if found
 * @throws {Error} If plan not found or other errors occur
 */
async function getPlanById(planId, { session = null, project = {} } = {}) {
  try {
    const plan = await Plan.findById(planId, project, { session });

    if (!plan) {
      throw new CustomError(PLAN_NOT_FOUND);
    }

    return plan;
  } catch (error) {
    logger.error(`Error fetching plan with ID ${planId}: ${error.message}`);
    throw error;
  }
}

module.exports = getPlanById;
