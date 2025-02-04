const router = require("express").Router();
const { applyValidation } = require("../../utils/validation-helper");

router.get("/get-users", require("./get-users"));
router.patch("/update-user-by-id", require("./update-user-by-id"));
router.patch("/update-profile", (req, res, next) =>
  applyValidation(
    require("./validation.js/update-profile.validation"),
    req.body,
    res,
    next
  ), require("./update-profile"));
router.patch("/suspend", require("./suspend-user"));
router.post(
  "/add-tl",
  (req, res, next) =>
    applyValidation(
      require("./validation.js/add-tl-user.validation"),
      req.body,
      res,
      next
    ),
  require("./add-tl-user")
);

router.get("/get-my-details", require("./get-my-details"));
router.get(
  "/get-user-by-id",
  (req, res, next) =>
    applyValidation(
      require("./validation.js/get-user-by-id.validation"),
      req.query,
      res,
      next
    ),
  require("./get-user-by-id")
);

router.get(
  "/get-team-member-stats",
  (req, res, next) =>
    applyValidation(
      require("./validation.js/get-team-member-stats.validation"),
      req.query,
      res,
      next
    ),
  require("./get-team-member-stats")
);

router.patch(
  "/update-user-profile",
  (req, res, next) =>
    applyValidation(
      require("./validation.js/update-user-profile.validation"),
      req.body,
      res,
      next
    ),
  require("./update-user-profile")
);

module.exports = router;
