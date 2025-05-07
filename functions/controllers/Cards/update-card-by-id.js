const { isEmpty } = require("lodash");
const {
  cardSchema,
  statesSchema,
  districtSchema,
  newTehsilSchema,
  areaSchema,
  tehsilSchema,
  gramSchema,
} = require("../../models");
const mongoose = require("mongoose");
const { updateCardById: updateCardByIdProcessor } = require("../../processors");
const { CustomError } = require("../../utils/custom-errors");
const { ErrorEnums, DBEnums } = require("../../Enums");

async function getLocationDetails({
  state,
  district,
  janpad,
  gramPanchayat,
  tehsil,
  gram,
}) {
  // State
  let stateExists = await statesSchema.findOne({
    _id: mongoose.Types.ObjectId(state),
  });
  if (!stateExists) throw new CustomError(ErrorEnums.STATE_NOT_FOUND);

  // District
  let districtExists = await districtSchema.findOne({
    _id: mongoose.Types.ObjectId(district),
    ref_id: state,
  });
  if (!districtExists) throw new CustomError(ErrorEnums.DISTRICT_NOT_FOUND);

  // Tehsil
  let tehsilExists = {};
  if (tehsil) {
    tehsilExists = await newTehsilSchema.findOne({
      _id: mongoose.Types.ObjectId(tehsil),
      ref_id: district,
    });
    if (!tehsilExists) throw new CustomError(ErrorEnums.TEHSIL_NOT_FOUND);
  }

  // Janpad
  let janpadExists = {};
  if (janpad) {
    janpadExists = await tehsilSchema.findOne({
      _id: mongoose.Types.ObjectId(janpad),
      ref_id: district,
    });
    if (!janpadExists) throw new CustomError(ErrorEnums.JANPAD_NOT_FOUND);
  }

  // Gram Panchayat
  let gramPanchayatExists = {};
  if (gramPanchayat) {
    gramPanchayatExists = await areaSchema.findOne({
      _id: mongoose.Types.ObjectId(gramPanchayat),
      ref_id: janpad,
    });
    if (!gramPanchayatExists)
      throw new CustomError(ErrorEnums.GRAM_PANCHAYAT_NOT_FOUND);
  }

  // Gram
  let gramExists = {};
  if (gram) {
    gramExists = await gramSchema.findOne({
      _id: mongoose.Types.ObjectId(gram),
      ref_id: gramPanchayat,
    });
    if (!gramExists) throw new CustomError(ErrorEnums.GRAM_NOT_FOUND);
  }
  return {
    ...(stateExists.name && { state: stateExists.name }),
    ...(districtExists.name && { district: districtExists.name }),
    ...(tehsilExists.name && { tehsil: tehsilExists.name }),
    ...(janpadExists.name && { janpad: janpadExists.name }),
    ...(gramPanchayatExists.name && {
      gramPanchayat: gramPanchayatExists.name,
    }),
    ...(gramExists.name && { gram: gramExists.name }),
  };
}

async function updateCardById(req, res, next) {
  try {
    const { role } = req.userDetails;
    // Handle validation
    if (req.body.family_members && req.body.family_members.length > 4) {
      throw new Error("Only four family members are allowed");
    }
    const oldCard = await cardSchema.findById(req.body.id);

    if (
      role === DBEnums.USER_ROLES.FE &&
      oldCard.status === DBEnums.CARD_STATUS.SUBMITTED
    ) {
      throw new CustomError(ErrorEnums.CARD_STATUS_ALREADY_SUBMITTED);
    }

    if (isEmpty(oldCard)) {
      throw new CustomError(ErrorEnums.CARD_NOT_FOUND);
    }

    if (
      req.body.district !== oldCard.district ||
      req.body.tehsil !== oldCard.tehsil ||
      req.body.janpad !== oldCard.janpad
    ) {
      const locationDetails = await getLocationDetails({
        state: req.body.state,
        district: req.body.district,
        tehsil: req.body.tehsil,
        janpad: req.body.janpad,
        gramPanchayat: req.body.gramPanchayat,
        gram: req.body.gram,
      });
      req.body.state = locationDetails.state || "";
      req.body.district = locationDetails.district || "";
      req.body.tehsil = locationDetails.tehsil || "";
      req.body.janpad = locationDetails.janpad || "";
      req.body.gramPanchayat = locationDetails.gramPanchayat || "";
      req.body.gram = locationDetails.gram || "";
    }

    const updatedData = {
      ...(req.body.image && { image: req.body.image }),
      ...(req.body.name && { name: req.body.name }),
      ...(req.body.birth_year && { birth_year: req.body.birth_year }),
      ...(req.body.gender && { gender: req.body.gender }),
      ...(req.body.id_proof && { id_proof: req.body.id_proof }),
      ...(req.body.state && { state: req.body.state }),
      ...(req.body.district && { district: req.body.district }),
      ...(req.body.janpad && { janpad: req.body.janpad }),
      ...(req.body.gramPanchayat && { gramPanchayat: req.body.gramPanchayat }),
      ...(req.body.gram && { gram: req.body.gram }),
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
