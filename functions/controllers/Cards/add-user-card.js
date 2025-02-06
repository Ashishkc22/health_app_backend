const { userSchema } = require("../../models");
const { DBEnums, ErrorEnums } = require("../../Enums");
const {
  getPlanById,
  getUser,
  getPurchaedPlanDetails,
} = require("../../processors");
const mongoose = require("mongoose");
const { addCard, getCardById } = require("../../processors");
const { isEmpty } = require("lodash");
const { CustomError } = require("../../utils/custom-errors");

const createCard = async (req, res, next) => {
  try {
    const userId = req.userDetails.id;
    const cardExists = await getCardById({
      adhaarValue: req.body.id_proof.value,
      userId,
    });
    if (cardExists) {
      throw new CustomError(ErrorEnums.CARD_ALREADY_EXISTS);
    }

    const userDetails = req.userDetails;
    const purchasedPlan = await getPurchaedPlanDetails({
      userId: mongoose.Types.ObjectId(req.userDetails.id),
      status: DBEnums.PLAN_STATUS.ACTIVE,
    });

    const planDetails = await getPlanById(purchasedPlan.planId, {
      project: { membershipDetails: 1 },
    });

    const agentDetails = await getUser({
      searchOptions: {
        $or: [{ role: DBEnums.USER_ROLES.FE }, { role: DBEnums.USER_ROLES.TL }],
        status: DBEnums.USER_STATUS.ACTIVE,
        current_district: req.body.district,
        current_state: req.body.state,
        current_tehsil: req.body.tehsil,
      },
    });
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

    const card = await addCard({
      data: {
        ...req.body,
        status_history: [
          {
            previous_status: DBEnums.CARD_STATUS.SUBMITTED,
            updated_status: DBEnums.CARD_STATUS.SUBMITTED,
            created_at: new Date().valueOf(),
            updated_by: {
              name: userDetails?.name || "",
              phone: userDetails?.phone || "",
              uid: userDetails?.uid || "",
            },
          },
        ],
      },
      userId: userDetails.id,
      creatorDetails: agentDetails || userDetails,
      planDetails: planDetails,
    });

    if (!card) {
      throw new CustomError(ErrorEnums.FAILED_TO_ADD_CARD);
    }
    if (!isEmpty(agentDetails)) {
      await userSchema.findByIdAndUpdate(agentDetails._id, {
        last_fetch: parseInt(Date.now()),
        $inc: {
          score: 1,
          p2_count: 1,
        },
      });
    }
    return res.status(200).json({
      status: "success",
      data: card,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = createCard;
