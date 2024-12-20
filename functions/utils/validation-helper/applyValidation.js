function applyValidation(validationSchema, payload, res, next) {
  try {
    const { error } = validationSchema.validate(payload);
    if (error) {
      return res.status(400).json({
        status: "Failed",
        message: error.stack,
      });
    }
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  applyValidation,
};
