const {
  statesSchema,
  districtSchema,
  newTehsilSchema,
  areaSchema,
  tehsilSchema,
  gramSchema,
  cardSchema,
  userSchema,
} = require("../../models");
const { DBEnums, ErrorEnums } = require("../../Enums");
const mongoose = require("mongoose");
const { CustomError } = require("../../utils/custom-errors");
const { isEmpty } = require("lodash");

async function getLocationDetails({
  state,
  district,
  janpad,
  gramPanchayat,
  tehsil,
  gram,
}) {
  // State
  const stateExists = await statesSchema.findOne({
    _id: mongoose.Types.ObjectId(state),
  });
  if (!stateExists) throw new CustomError(ErrorEnums.STATE_NOT_FOUND);
  // District
  const districtExists = await districtSchema.findOne({
    _id: mongoose.Types.ObjectId(district),
    ref_id: state,
  });
  if (!districtExists) throw new CustomError(ErrorEnums.DISTRICT_NOT_FOUND);
  // Tehsil
  let tehsilExists,
    janpadExists,
    gramPanchayatExists,
    gramExists = {};

  if (tehsil) {
    tehsilExists = await newTehsilSchema.findOne({
      _id: mongoose.Types.ObjectId(tehsil),
      ref_id: district,
    });
    if (!tehsilExists) throw new CustomError(ErrorEnums.TEHSIL_NOT_FOUND);
  }

  if (janpad) {
    janpadExists = await tehsilSchema.findOne({
      _id: mongoose.Types.ObjectId(janpad),
      ref_id: district,
    });
    if (!janpadExists) throw new CustomError(ErrorEnums.JANPAD_NOT_FOUND);
  }

  if (gramPanchayat) {
    gramPanchayatExists = await areaSchema.findOne({
      _id: mongoose.Types.ObjectId(gramPanchayat),
      ref_id: janpad,
    });
    if (!gramPanchayatExists)
      throw new CustomError(ErrorEnums.GRAM_PANCHAYAT_NOT_FOUND);
  }

  if (gram) {
    gramExists = await gramSchema.findOne({
      _id: mongoose.Types.ObjectId(gram),
      ref_id: gramPanchayat,
    });
    if (!gramExists) throw new CustomError(ErrorEnums.GRAM_NOT_FOUND);
  }
  return {
    state: stateExists.name,
    district: districtExists.name,
    ...(tehsilExists && { tehsil: tehsilExists.name }),
    ...(janpadExists && { janpad: janpadExists.name }),
    ...(gramPanchayatExists && { gramPanchayat: gramPanchayatExists.name }),
    ...(gramExists && { gram: gramExists.name }),
  };
}

const createCard = async (req, res) => {
  try {
    const userr = await userSchema
      .findById(req.userDetails.id)
      .populate("current_state", "name")
      .populate("current_district", "name")
      .populate("current_tehsil", "name")
      .populate("current_gram_panchayat", "name")
      .populate("current_gram", "name")
      .populate("current_janpad", "name");

    if (
      !userr.current_state ||
      !userr.current_district ||
      !userr.current_tehsil ||
      !userr.current_gram_panchayat ||
      !userr.current_gram
    ) {
      return res.status(200).json({
        status: "failed",
        message: "Agent location not found. Please reset the location.",
      });
    }

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

    const existingCard = await cardSchema
      .find({
        name: req.body.name,
        father_husband_name: req.body.father_husband_name,
      })
      .lean();

    if (!isEmpty(existingCard)) {
      throw new CustomError(ErrorEnums.CARD_ALREADY_EXISTS);
    }

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
    let state,
      district,
      tehsil,
      janpad,
      gramPanchayat,
      gram = null;

    if (
      req.body.state &&
      req.body.district &&
      req.body.tehsil &&
      req.body.janpad &&
      req.body.gramPanchayat &&
      req.body.gram
    ) {
      const locationDetsils = await getLocationDetails({
        state: req.body.state,
        district: req.body.district,
        tehsil: req.body.tehsil,
        janpad: req.body.janpad,
        gramPanchayat: req.body.gramPanchayat,
        gram: req.body.gram,
      });
      state = locationDetsils.state;
      district = locationDetsils.district;
      tehsil = locationDetsils.tehsil || "";
      janpad = locationDetsils.janpad || "";
      gramPanchayat = locationDetsils.gramPanchayat || "";
      gram = locationDetsils.gram || "";
    } else {
      if (
        userr.current_state == null ||
        userr.current_district == null ||
        userr.current_tehsil == null ||
        userr.current_gram_panchayat == null ||
        userr.current_gram == null
      ) {
        return res.status(200).json({
          status: "failed",
          message: "Agent location not found. Please provide location details",
        });
      }
      state = userr.current_state.name;
      district = userr.current_district.name;
      tehsil = userr.current_tehsil?.name || "";
      janpad = userr.current_janpad?.name || "";
      gramPanchayat = userr.current_gram_panchayat?.name || "";
      gram = userr.current_gram?.name || "";
    }

    const area = `${gram} , ${gramPanchayat}`;

    const issueDate = new Date(parseInt(Date.now()));
    let family_member_details = {};
    if (req.body.card_type === "Family") {
      family_member_details = {
        family_members: req.body.family_members,
      };
    }
    const card = cardSchema({
      image: req.body.image,
      birth_year: req.body.birth_year,
      name: req.body.name,
      gender: req.body.gender,
      id_proof: req.body.id_proof,
      ...(req.body?.uncropped_adhar_image && {
        uncropped_adhar_image: req.body.uncropped_adhar_image,
      }),
      state: state,
      district: district,
      tehsil: tehsil,
      janpad: janpad,
      gramPanchayat: gramPanchayat,
      gram: gram,
      area: area,
      phone: req.body.phone,
      father_husband_name: req.body.father_husband_name,
      blood_group: req.body.blood_group,
      emergency_contact: req.body.emergency_contact,
      created_by: userr._id || userr.id,
      created_at: parseInt(Date.now()),
      status: DBEnums.CARD_STATUS.PENDING,
      expiry_date: parseInt(Date.now()) + 2 * 365 * 24 * 60 * 60 * 1000,
      expiry_years: 2,
      created_by_uid: userr.uid,
      created_by_name: userr.name,
      issue_date: `${issueDate.getDate().toString().padStart(2, "0")}/${(
        issueDate.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}/${issueDate.getFullYear()}`,
      status_history: [
        {
          previous_status: DBEnums.CARD_STATUS.PENDING,
          updated_status: DBEnums.CARD_STATUS.PENDING,
          created_at: new Date().valueOf(),
          updated_by: {
            name: userr.name,
            phone: userr.phone,
            uid: userr.uid,
          },
        },
      ],
      status_updated_at: new Date(),
      unique_number: uuid,
      s_no: req.body.s_no || "",
      card_type: req.body.card_type,
      ...family_member_details,
      total_price_before_discount: req.body.total_price_before_discount,
      total_price_after_discount: req.body.total_price_after_discount,
      received_amount: req.body.received_amount,
      remaining_amount: req.body.remaining_amount,
      plan_validity: req.body.plan_validity,
      ...(req.body.abha_id && { abha_id: req.body.abha_id }),
      ...(req.body.notes && { notes: req.body.notes }),
      pwd: req.body.pwd,
    });
    if (card == null) {
      return res.status(200).json({
        status: "failed",
        message: "Invalid Data",
      });
    }
    // const dsb = await dashboard_data.findOne({ uid: usr._id });
    // if (dsb == null) {
    //     await dashboard_data({
    //         rank: await dashboard_data.countDocuments(),
    //         name: usr.name,
    //         location: usr.address,
    //         score: 1,
    //         ratio: 0,
    //         uid: usr._id
    //     }).save();
    // } else {
    //     dsb.score = (dsb.score || 0) + 1;
    //     dsb.name = usr.name;
    //     await dsb.save();
    // }
    const resp = await card.save();
    await userSchema.findByIdAndUpdate(userr._id, {
      last_fetch: parseInt(Date.now()),
      $inc: {
        score: 1,
        p2_count: 1,
      },
    });
    return res.status(200).json({
      status: "success",
      message: "Card updated successfully",
      data: resp,
    });
  } catch (err) {
    return res.status(200).json({
      status: "failed",
      message: err.message,
    });
  }
};

module.exports = createCard;
