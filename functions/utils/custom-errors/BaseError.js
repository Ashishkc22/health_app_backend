class BaseError extends Error {
  constructor(name, httpCode, isOprational, description) {
    super(description);
    Object.setPrototypeOf(this, new.target.prototype);

    this.name = name;
    this.httpCode = httpCode;
    this.isOprational = isOprational;
    this.description = description;

    Error.captureStackTrace(this);
  }
}

module.exports = BaseError;
