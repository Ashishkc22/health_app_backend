const express = require("express");
const router = express.Router();
const { CustomError } = require("../../utils/custom-errors");
const { ErrorEnums } = require("../../Enums");
const addCardValidation = require("./validation/add-cards.validation");
const getCardById = require("./get-card-by-id");
const getCardUsers = require("./get-card-users");
const { applyValidation } = require("../../utils/validation-helper");

router.post(
  "/",
  (req, res, next) => applyValidation(addCardValidation, req.body, res, next),
  require("./add-card")
);
router.post("/mark-cards-as-printed", require("./mark-cards-as-printed"));
router.patch(
  "/update-card-status-by-id",
  require("./update-card-status-by-id")
);
router.patch(
  "/update-card-by-id",
  (req, res, next) =>
    applyValidation(
      require("./validation/update-card-by-id.validation"),
      req.body,
      res,
      next
    ),
  require("./update-card-by-id")
);

router.get("/", require("./get-cards"));
router.get("/get-my-cards", require("./get-my-cards"));
router.get("/to-be-printed", require("./get-to-be-printed"));
router.get("/get-card-by-id", getCardById);
router.get("/card-users", getCardUsers);

module.exports = router;
