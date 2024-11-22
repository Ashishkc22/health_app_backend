const { isEmpty } = require("lodash");
const cardSch = require("../models/card.js");
const updateCardByIdProcessor = require("../processors/updateCardById");
const updateUserById = require("../processors/updateUserById");

const statusFlowMapper = {
  SUBMITTED: ["PRINTED", "DISCARDED"],
  PRINTED: ["RECEIVED", "REPRINT", "DISCARDED"],
  RECEIVED: ["DELIVERED", "DISCARDED"],
  DELIVERED: ["DISCARDED", "DISCARDED"],
  DISCARDED: ["DELIVERED", "REPRINT"],
};
const statusEnum = [
  "SUBMITTED",
  "PRINTED",
  "UNDELIVERED",
  "DELIVERED",
  "DISCARDED",
  "RTO",
  "REPRINT",
  "RECEIVED",
];
const increaseMapper = {
  SUBMITTED: {
    p2_count: 1,
  },
  PRINTED: {
    p_count: 1,
  },
  DELIVERED: {
    d_count: 1,
  },
  UNDELIVERED: { ud_count: 1 },
  DISCARDED: { dis_count: 1 },
  RTO: { RTO_count: 1 },
};
async function updateCardById(req, res) {
  try {
    // Handle validation
    if (req.body.family_members && req.body.family_members.length > 4) {
      throw new Error("Only four family members are allowed");
    }
    const oldCard = await cardSch.findById(req.params.id);
    if (isEmpty(oldCard)) {
      throw new Error("No card found.");
    }
    if (
      req.body?.status &&
      statusEnum.includes(req.body.status.toString().toUpperCase()) &&
      !statusFlowMapper[oldCard.status].includes(
        req.body.status.toString().toUpperCase()
      )
    ) {
      return res.status(400).json({
        status: "Failed",
        message: "Card status can not be updated.",
      });
    }
    const updatedData = {
      ...(req.body.image && { image: req.body.image }),
      ...(req.body.name && { name: req.body.name }),
      ...(req.body.birth_year && { birth_year: req.body.birth_year }),
      ...(req.body.gender && { gender: req.body.gender }),
      ...(req.body.id_proof && { id_proof: req.body.id_proof }),
      ...(req.body.state && { state: req.body.state }),
      ...(req.body.district && { district: req.body.district }),
      ...(req.body.tehsil && { tehsil: req.body.tehsil }),
      ...(req.body.area && { area: req.body.area }),
      ...(req.body.phone && { phone: req.body.phone }),
      ...(req.body.father_husband_name && {
        father_husband_name: req.body.father_husband_name,
      }),
      ...(req.body.blood_group && { blood_group: req.body.blood_group }),
      ...(req.body.emergency_contact && {
        emergency_contact: req.body.emergency_contact,
      }),
      ...(req.body.expiry_date && {
        expiry_date: parseInt(req.body.expiry_date.toString()),
      }),
      ...(req.body.expiry_years && {
        expiry_years: parseInt(req.body.expiry_years.toString()),
      }),
      ...(req.body.discard_reason && {
        discard_reason: req.body.discard_reason,
      }),
      ...(req.body.family_members &&
        req.body.family_members.length <= 4 && {
          family_members: req.body.family_members,
        }),
      ...(req.body.status && {
        status: req.body.status,
        $push: {
          status_history: {
            previous_status: oldCard.status,
            updated_status: req.body.status,
            created_at: new Date().valueOf(),
            ...(req.body?.discard_reason && {
              reason: req.body.discard_reason,
            }),
            updated_by: {
              name: req.userDetails.name,
              phone: req.userDetails.phone,
              _id: req.userDetails._id,
              uid: req.userDetails.uid,
            },
            ...(req.body.reSubmit && { isReSubmitted: req.body.reSubmit }),
          },
        },
      }),
    };
    if (req.body.reSubmit) {
      req.body.status = "SUBMITTED";
    } else if (req.body.status) {
      await updateUserById({
        id,
        updatedData: {
          $inc: {
            ...increaseMapper[req.body.status],
            score: 1,
            ...(req.body.status === "DISCARDED" && { p2_count: -1 }),
          },
        },
      });
    }

    return res.status(200).json({
      status: "success",
      data: await updateCardByIdProcessor({ id: req.params.id, updatedData }),
    });
  } catch (error) {
    console.error("Failed at update card by id controller.", error.message);
    res.status(400).json({
      status: "failed",
      message: "Failed to update card.",
    });
  }
}

module.exports = updateCardById;
