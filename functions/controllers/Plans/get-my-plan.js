const { getPurchaedPlanDetails,getPlanById } = require("../../processors");
const mongoose = require("mongoose");
const { logger } = require("../../utils/logger");

async function getMyPlan(req, res, next) {
  try {
    const plan = await getPurchaedPlanDetails({
      userId: mongoose.Types.ObjectId(req.userDetails.id),
      status: "ACTIVE",
    });
    const planDetails = await getPlanById(plan.planId);
    return res.status(200).json({
      status: "success",
      data: planDetails,
    });
  } catch (error) {
    logger.error("Controller Error in get My Plan :", error);
    next(error);
  }
}

module.exports = getMyPlan;
