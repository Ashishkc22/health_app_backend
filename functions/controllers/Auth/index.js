const router = require("express").Router();
const { applyValidation } = require("../../utils/validation-helper");

router.post(
  "/login",
  (re, res, next) =>
    applyValidation(
      require("./validation.js/login.validation"),
      re.body,
      res,
      next
    ),
  require("./login")
);

router.post(
  "/sendCode",
  (re, res, next) =>
    applyValidation(
      require("./validation.js/get-otp.validation"),
      re.body,
      res,
      next
    ),
  require("./get-otp")
);

router.post(
  "/verifyCode",
  (re, res, next) =>
    applyValidation(
      require("./validation.js/varify-otp.validation"),
      re.body,
      res,
      next
    ),
  require("./verify-otp")
);

router.post(
  "/submitPassword",
  (re, res, next) =>
    applyValidation(
      require("./validation.js/reset-password"),
      re.body,
      res,
      next
    ),
  require("./reset-password")
);

router.post(
  "/register",
  (re, res, next) =>
    applyValidation(
      require("./validation.js/sign-up-user.validation"),
      re.body,
      res,
      next
    ),
  require("./sign-up-user")
);

// router.get("/user", require("./get-user-by-tl-id"));

module.exports = router;
