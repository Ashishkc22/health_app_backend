const { BaseError } = require("../utils/custom-errors");
const { logger } = require("../utils/logger");

module.exports = async (err, req, res, next) => {
  try {
    if (err instanceof BaseError) {
      logger.error(err.description);
    }
    if (err.isGoogleLoginError) {
      return res.status(400).redirect(err.redirectUrl);
    }
    res.status(400).json({
      status: "failed",
      code: err?.httpCode,
      message: err?.description || "Somthing went wrong.",
    });
  } catch (error) {
    logger.crit("Somthing went wrong in error handling function.");
    res.status(400).json({
      status: "failed",
      code: err?.httpCode || 400,
      message: "Somthing went wrong.",
    });
  }
};
