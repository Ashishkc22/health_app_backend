const router = require("express").Router();
const addHospitalValidation = require("./validation/add-hospital");
const { applyValidation } = require("../../utils/validation-helper");

router.post(
  "/add-hospital",
  (req, res, next) =>
    applyValidation(addHospitalValidation, req.body, res, next),
  require("./add-hospital")
);

router.get("/get-hospital-by-id", require("./get-hospital-by-id"));
router.get("/get-hospitals", require("./get-hospitals"));
router.patch(
  "/update-hospital-by-id",
  (req, res, next) =>
    applyValidation(
      require("./validation/update-hospital-by-id"),
      req.body,
      res,
      next
    ),
  require("./update-hospital-by-id")
);

module.exports = router;
