const router = require("express").Router();
const { applyValidation } = require("../../utils/validation-helper");

router.post(
  "/purchase-plan",
  (req, res, next) =>
    applyValidation(
      require("./validation/purchase-plan.validation"),
      req.body,
      res,
      next
    ),
  require("./purchase-plan")
);

router.post(
  "/plan-checkout",
  (req, res, next) =>
    applyValidation(
      require("./validation/plan-checkout.validation"),
      req.body,
      res,
      next
    ),
  require("./plan-checkout")
);

module.exports = router;
