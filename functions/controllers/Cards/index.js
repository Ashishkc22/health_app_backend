const express = require("express");
const router = express.Router();
const { CustomError } = require("../../utils/custom-errors");
const { ErrorEnums } = require("../../Enums");
const addCardValidation = require("./validation/add-cards.validation");
const addUserCardValidation = require("./validation/add-user-card.validation");
const getCardById = require("./get-card-by-id");
const getCardByUserId = require("./get-card-by-userid");
const getCardUsers = require("./get-card-users");
const { applyValidation } = require("../../utils/validation-helper");

router.post(
  "/add-card",
  (req, res, next) => applyValidation(addCardValidation, req.body, res, next),
  require("./add-card")
);
router.post(
  "/add-user-card",
  (req, res, next) => applyValidation(addUserCardValidation, req.body, res, next),
  require("./add-user-card")
);
router.post("/mark-cards-as-printed", require("./mark-cards-as-printed"));
router.patch(
  "/update-card-status-by-id",
  require("./update-card-status-by-id")
);
router.patch(
  "/update-user-card",
  (req, res, next) =>
    applyValidation(
      require("./validation/update-card-by-id.validation"),
      req.body,
      res,
      next
    ),
  require("./update-user-card")
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

router.get("/get-cards", require("./get-cards"));
router.get("/get-card-by-userid", getCardByUserId);
router.get("/get-my-cards", require("./get-my-cards"));
router.get("/get-my-card", require("./get-my-card"));
router.get("/to-be-printed", require("./get-to-be-printed"));
router.get("/get-card-by-id", getCardById);
router.get("/card-users", getCardUsers);

module.exports = router;
