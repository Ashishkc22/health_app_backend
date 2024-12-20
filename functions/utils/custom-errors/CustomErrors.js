const BaseError = require("./BaseError");
const HTTPS_ERRORS = require("../../Enums/httpsErrors");

class CustomError extends BaseError {
  constructor({
    name,
    httpCode = HTTPS_ERRORS.INTERNAL_SERVER.code,
    isOperational = true,
    description = HTTPS_ERRORS.INTERNAL_SERVER.message,
  }) {
    super(name, httpCode, isOperational, description);
  }
}

module.exports = CustomError;
