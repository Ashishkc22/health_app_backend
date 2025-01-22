const { DBEnums, CardEnums } = require("../Enums");
const { isEmpty } = require("lodash");
const { cardSchema } = require("../models");
const { logger } = require("../utils/logger");
const mongoose = require("mongoose");

const getYearsInMilliseconds = (years) =>
  parseInt(Date.now()) + years * 365 * 24 * 60 * 60 * 1000;

const getUid = async () => {
  let uuid;
  while (true) {
    var x = (Math.floor(Math.random() * (9999999 - 1000001 + 1)) + 1000001)
      .toString()
      .padStart(7, "0");
    const qry = await cardSchema.countDocuments({ unique_number: x });
    if ((qry || 0) == 0) {
      uuid = x;
      break;
    }
  }
  return uuid;
};

const addCard = async ({
  data = {},
  creatorDetails = {},
  planDetails = {},
  userId = "",
}) => {
  try {
    const issueDate = new Date(parseInt(Date.now()));
    const cardData = {
      ...(data.image && { image: data.image }),
      ...(data.birth_year && { birth_year: data.birth_year }),
      ...(data.name && { name: data.name }),
      ...(data.gender && { gender: data.gender }),
      ...(data.id_proof && { id_proof: data.id_proof }),
      ...(data.state && { state: data.state }),
      ...(data.district && { district: data.district }),
      ...(data.tehsil && { tehsil: data.tehsil }),
      ...(data.area && { area: data.area }),
      ...(data.phone && { phone: data.phone }),
      ...(data.father_husband_name && {
        father_husband_name: data.father_husband_name,
      }),
      ...(data.blood_group && { blood_group: data.blood_group }),
      ...(data.emergency_contact && {
        emergency_contact: data.emergency_contact,
      }),
      issue_date: `${issueDate.getDate().toString().padStart(2, "0")}/${(
        issueDate.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}/${issueDate.getFullYear()}`,
      status_history: data.status_history || [],
      status_updated_at: new Date(),
      created_by: creatorDetails?._id || "User",
      created_by_uid: creatorDetails?.uid || "USER######",
      created_at: parseInt(Date.now()),
      status: DBEnums.CARD_STATUS.PENDING,
      expiry_years:
        planDetails?.membershipDetails?.validityPeriod?.duration || 1,
      ...(userId && { userId: mongoose.Types.ObjectId(userId) }),
      unique_number: await getUid(),
      s_no: data.s_no || "",
      ...(data.total_price_before_discount && {
        total_price_before_discount: data.total_price_before_discount,
      }),
      ...(data.total_price_after_discount && {
        total_price_after_discount: data.total_price_after_discount,
      }),
      ...(data.received_amount && { received_amount: data.received_amount }),
      ...(data.remaining_amount && { remaining_amount: data.remaining_amount }),
      ...(data.plan_validity && { plan_validity: data.plan_validity }),
      ...(data.abha_id && { abha_id: data.abha_id }),
      ...(data.notes && { notes: data.notes }),
      card_type: data.card_type || CardEnums.CARD_TYPE.Single,
      pwd: data.pwd,
    };
    if (data.card_type === CardEnums.CARD_TYPE.Family) {
      cardData.family_members = data.family_members;
    }
    if (!isEmpty(planDetails)) {
      cardData.expiry_date = planDetails?.membershipDetails?.validityPeriod
        ?.infinite
        ? null
        : getYearsInMilliseconds(
            planDetails.membershipDetails.validityPeriod.duration
          );
    } else {
      cardData.expiry_date = getYearsInMilliseconds(1);
    }

    const card = new cardSchema(cardData);
    await card.save();
    return card;
  } catch (error) {
    logger.error("[Processor] Failed in add card processor", error.message);
    throw error;
  }
};

module.exports = addCard;
