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

// Add this with the other routes
router.post(
  "/renew-plan",
  (req, res, next) =>
    applyValidation(
      require("./validation/renew-plan.validation"),
      req.body,
      res,
      next
    ),
  require("./renew-plan")
);

router.post(
  "/p2p-coin",
  (req, res, next) =>
    applyValidation(
      require("./validation/p2p-coin.validation"),
      req.body,
      res,
      next
    ),
  require("./p2p-coin")
);

module.exports = router;
