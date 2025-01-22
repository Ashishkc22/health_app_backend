const { logger } = require("../../utils/logger");
const { getPlans: getPlansProcessor } = require("../../processors");

async function getPlans(req, res, next) {
  try {
    const plans = await getPlansProcessor();

    return res.status(200).json({
      status: "success",
      data: plans,
    });
  } catch (error) {
    logger.error("Controller Error in get plans:", error);
    next(error);
  }
}

module.exports = getPlans;
