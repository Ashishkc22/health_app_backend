const router = require("express").Router();
const { applyValidation } = require("../../utils/validation-helper");
const addHospitalValidation = require("./validation/add-hospital.validation");

router.post(
  "/add-hospital",
  (req, res, next) =>
    applyValidation(addHospitalValidation, req.body, res, next),
  require("./add-hospital")
);
router.get("/get-hospitals", require("./get-hospitals"));
module.exports = router;