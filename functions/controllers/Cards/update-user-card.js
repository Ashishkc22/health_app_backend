const { userSchema } = require("../../models");
const { DBEnums, ErrorEnums } = require("../../Enums");
const {
  getPlanById,
  getUser,
  getPurchaedPlanDetails,
  updateCardById,
} = require("../../processors");
const mongoose = require("mongoose");
const { getCardById } = require("../../processors");
const { isEmpty } = require("lodash");
const { CustomError } = require("../../utils/custom-errors");

const updateCard = async (req, res, next) => {
  try {
    const userDetails = req.userDetails;
    const cardExists = await getCardById({
      adhaarValue: req.body.id_proof.value,
      userId: userDetails.id,
    });
    if (!cardExists) {
      throw new CustomError(ErrorEnums.CARD_DOES_NOT_EXIST);
    }

    // const purchasedPlan = await getPurchaedPlanDetails({
    //   userId: mongoose.Types.ObjectId(req.userDetails.id),
    //   status: DBEnums.PLAN_STATUS.ACTIVE,
    // });

    // if(!purchasedPlan){
    //   throw new CustomError(ErrorEnums.NO_ACTIVE_PLAN_FOUND);
    // }

    if (/[0-9]/.test(req.body.name || "")) {
      return res.status(200).json({
        status: "failed",
        message: "Name should not contain numerial values",
      });
    }
    if (!/^-?\d+$/.test(req.body.birth_year || "")) {
      return res.status(200).json({
        status: "failed",
        message: "Year of birth should not contain alphabets",
      });
    }

    const card = await updateCardById({
      id: cardExists._id,
      updatedData: req.body,
    });

    return res.status(200).json({
      status: "success",
      data: card,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = updateCard;
