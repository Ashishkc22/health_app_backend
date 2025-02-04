const { purchasedPlanSchema } = require("../models");
const { logger } = require("../utils/logger");
const { CustomError } = require("../utils/custom-errors");
const { ProcessorErrors } = require("../Enums");

/**
 * Updates a purchased plan's expire date if it is not null
 * @param {Object} updateData - The data to update
 * @param {ObjectId} id - The ID of the purchased plan to update
 * @returns {Promise<Object>} The updated purchased plan
 */
async function updatePurchasedPlanDetails({ userId, planId, updateData }) {
  try {
    const purchasedPlan = await purchasedPlanSchema.findOne({
      userId: userId,
      planId: planId,
    });
    if (!purchasedPlan) {
      throw new CustomError(ProcessorErrors.PURCHASED_PLAN_NOT_FOUND);
    }
    const updatedPurchasedPlan = await purchasedPlanSchema.findOneAndUpdate(
      {
        userId: userId,
        planId: planId,
      },
      {
        $set: {
          ...updateData,
        },
      },
      {
        new: true,
      }
    );
    return updatedPurchasedPlan;
  } catch (error) {
    logger.error(`[Processor] Error updating purchased plan: ${error.message}`);
    throw error;
  }
}

module.exports = updatePurchasedPlanDetails;
