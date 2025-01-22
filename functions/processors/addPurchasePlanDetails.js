const { purchasedPlanSchema } = require("../models");
const { logger } = require("../utils/logger");
const { CustomError } = require("../utils/custom-errors");
const { ProcessorErrors } = require("../Enums");
const moment = require("moment");

module.exports = async ({ userId, planDetails, transactionId, amount, currency, session }) => {
    try {
        const { membershipDetails,_id } = planDetails;
        const now = moment();
        const startDate = now.startOf("day").toISOString();
        let endDate = null;
        if (!membershipDetails.validityPeriod.infinite) {
            endDate = now.add(membershipDetails.validityPeriod.duration, membershipDetails.validityPeriod.type).startOf("day").toISOString()
        }
        const purchasedPlan = new purchasedPlanSchema({
            userId,
            planId:_id,
            transactionId,
            amount,
            currency,
            startDate,
            endDate,
        });
        await purchasedPlan.save({ session });
        return purchasedPlan;
    } catch (error) {
        logger.error(error);
        throw new CustomError(ProcessorErrors.FAILED_TO_ADD_PURCHASE_PLAN_DETAILS);
    }
};
