const express = require("express");
const router = express.Router();
const addAddressValidation = require("./validations/add-address.validation");
const updateAddressValidation = require("./validations/update-address.validation");
const getAddressByType = require("./validations/get-address-by-type.validation");
const { CustomError } = require("../../utils/custom-errors");
const { ErrorEnums } = require("../../Enums");

const locationCategories = [
  "state",
  "district",
  "tehsil",
  "janPanchayat",
  "gramPanchayat",
  "gram",
];

function validationExtension(req, res, next) {
  try {
    const type = req.body?.type || req.query.type;
    let payload = req.body;
    if (!locationCategories.includes(type)) {
      throw new CustomError(ErrorEnums.ADD_ADDRESS_ERRORS.addressType);
    }
    let validationSchema = addAddressValidation[type];
    if (req.method === "PATCH") {
      validationSchema = updateAddressValidation[type];
    } else if (req.method === "GET") {
      validationSchema = getAddressByType;
      payload = req.query;
    }
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

router.post("/add-address", validationExtension, require("./add-address"));
router.get(
  "/get-address-by-type",
  validationExtension,
  require("./get-address-by-type")
);
router.get("/all-get-janpanchyat", require("./get-janpanchyat"));
router.patch(
  "/update-address",
  validationExtension,
  require("./update-address")
);

// remember to add Add location api

module.exports = router;
