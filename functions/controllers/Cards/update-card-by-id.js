const { isEmpty } = require("lodash");
const { cardSchema } = require("../../models");
const { updateCardById: updateCardByIdProcessor } = require("../../processors");
const { CustomError } = require("../../utils/custom-errors");
const { ErrorEnums } = require("../../Enums");

async function updateCardById(req, res, next) {
  try {
    // Handle validation
    if (req.body.family_members && req.body.family_members.length > 4) {
      throw new Error("Only four family members are allowed");
    }
    const oldCard = await cardSchema.findById(req.body.id);
    if (isEmpty(oldCard)) {
      throw new CustomError(ErrorEnums.CARD_NOT_FOUND);
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
    };
    if (req.body.reSubmit) {
      updatedData.status = "SUBMITTED";
    }
    return res.status(200).json({
      status: "success",
      data: await updateCardByIdProcessor({ id: req.body.id, updatedData }),
    });
  } catch (error) {
    console.error("Failed at update card by id controller.", error.message);
    next(error);
  }
}

module.exports = updateCardById;
