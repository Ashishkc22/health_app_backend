const { isEmpty } = require("lodash");
const { updateUserById, getUser } = require("../../processors");
const { CustomError } = require("../../utils/custom-errors");
const { ErrorEnums, DBEnums } = require("../../Enums");
const {
  userSchema,
  statesSchema,
  districtSchema,
  newTehsilSchema,
  tehsilSchema,
  gramSchema,
  areaSchema,
} = require("../../models");

// async function getLocationDetails({
//   state,
//   district,
//   janpad,
//   gramPanchayat,
//   tehsil,
//   gram,
// }) {
//   // State
//   const stateExists = await statesSchema.findOne({
//     _id: mongoose.Types.ObjectId(state),
//   });
//   if (!stateExists) throw new CustomError(ErrorEnums.STATE_NOT_FOUND);
//   // District
//   const districtExists = await districtSchema.findOne({
//     _id: mongoose.Types.ObjectId(district),
//     ref_id: state,
//   });
//   if (!districtExists) throw new CustomError(ErrorEnums.DISTRICT_NOT_FOUND);
//   // Tehsil
//   let tehsilExists,
//     janpadExists,
//     gramPanchayatExists,
//     gramExists = {};

//   if (tehsil) {
//     tehsilExists = await newTehsilSchema.findOne({
//       _id: mongoose.Types.ObjectId(tehsil),
//       ref_id: district,
//     });
//     if (!tehsilExists) throw new CustomError(ErrorEnums.TEHSIL_NOT_FOUND);
//   }

//   if (janpad) {
//     janpadExists = await tehsilSchema.findOne({
//       _id: mongoose.Types.ObjectId(janpad),
//       ref_id: district,
//     });
//     if (!janpadExists) throw new CustomError(ErrorEnums.JANPAD_NOT_FOUND);
//   }

//   if (gramPanchayat) {
//     gramPanchayatExists = await areaSchema.findOne({
//       _id: mongoose.Types.ObjectId(gramPanchayat),
//       ref_id: janpad,
//     });
//     if (!gramPanchayatExists)
//       throw new CustomError(ErrorEnums.GRAM_PANCHAYAT_NOT_FOUND);
//   }

//   if (gram) {
//     gramExists = await gramSchema.findOne({
//       _id: mongoose.Types.ObjectId(gram),
//       ref_id: gramPanchayat,
//     });
//     if (!gramExists) throw new CustomError(ErrorEnums.GRAM_NOT_FOUND);
//   }
//   return {
//     state: stateExists,
//     district: districtExists,
//     ...(tehsilExists && { tehsil: tehsilExists }),
//     ...(janpadExists && { janpad: janpadExists }),
//     ...(gramPanchayatExists && { gramPanchayat: gramPanchayatExists }),
//     ...(gramExists && { gram: gramExists }),
//   };
// }

// Helper function to prepare update fields based on user roles
function prepareUpdateFields(req, oldData, requestUser) {
  const fields = {};

  // Define field update permissions based on user roles
  const roleBasedFieldUpdates = {
    ADMIN: [
      "name",
      "phone",
      "email",
      "role",
      "status",
      "suspension_reason",
      "image",
      "passportImage",
      "registrationFormImage",
      "agreementImage",
      "panCardImage",
      "signatureImage",
      "id_proof",
      "address",
      "emergency_contact",
      "blood_group",
      "dob",
      "state",
      "district",
      // "current_state",
      // "current_district",
      // "current_janpad",
      // "current_gram_panchayat",
      // "current_gram",
      // "current_tehsil",
      // "current_location_type",
      // "current_city",
      // "current_pincode",
      // "current_maplink",
    ],
    TL: [
      "name",
      "phone",
      "email",
      "image",
      "passportImage",
      "registrationFormImage",
      "agreementImage",
      "panCardImage",
      "signatureImage",
      "id_proof",
      "address",
      "emergency_contact",
      "blood_group",
      "dob",
      "state",
      "district",
    ],
    USER: [
      "name",
      "phone",
      "email",
      "image",
      "emergency_contact",
      "blood_group",
      "dob",
    ],
  };

  // Get allowed fields based on user role
  const allowedFields =
    roleBasedFieldUpdates[requestUser.role] || roleBasedFieldUpdates["USER"];

  // Validate location and update it.
  // if (
  //   requestUser.current_district !== oldData.current_district ||
  //   requestUser.janpad !== oldData.current_janpad ||
  //   requestUser.gramPanchayat !== oldData.current_gram_panchayat
  // ) {
  //   const locationDetails = await getLocationDetails({
  //     state: requestUser.state,
  //     district: requestUser.current_district,
  //     tehsil: requestUser.current_tehsil,
  //     janpad: requestUser.current_janpad,
  //     gramPanchayat: requestUser.current_gram_panchayat,
  //     gram: requestUser.current_gram,
  //   });
  //   requestUser.current_state = locationDetails.state._id;
  //   requestUser.current_district = locationDetails.district._id;
  //   requestUser.current_janpad = locationDetails.janpad._id || "";
  //   requestUser.current_gram_panchayat =
  //     locationDetails.gramPanchayat._id || "";
  //   requestUser.current_gram = locationDetails.gram._id || "";
  //   requestUser.current_tehsil = locationDetails.tehsil._id || "";
  // }

  // Add fields from request body if they are allowed and not null
  allowedFields.forEach((field) => {
    if (req.body[field] != null) {
      fields[field] = req.body[field];
    }
  });

  // Special handling for specific scenarios
  if (requestUser.role === "ADMIN") {
    // Admin can change role
    if (req.body.role != null) {
      fields.role = req.body.role;
    }

    // Admin can update status and suspension reason
    if (req.body.status != null) {
      fields.status = req.body.status;
      fields.suspension_reason = req.body.suspension_reason || "";
    }
  }

  // Handle Team Leader specific logic
  if (req.body.role === "TL") {
    // Remove team leader ID if changing to TL
    if (oldData.tl_id && req.body.role === "TL") {
      fields.team_leader_id = "";
    }
  }

  // Prevent changing critical fields for non-admin users
  if (requestUser.role !== "ADMIN") {
    delete fields.role;
    delete fields.status;
    delete fields.suspension_reason;
  }

  return fields;
}
// Helper function to generate unique TL ID
async function generateTLId() {
  while (true) {
    const randomNum = (Math.floor(Math.random() * (99999 - 10001 + 1)) + 10001)
      .toString()
      .padStart(5, "0");
    const uid = `TL${randomNum}`;

    const exists = await userSchema.exists({ tl_id: uid });
    if (!exists) {
      return uid;
    }
  }
}

const updateUserDetailsById = async (req, res, next) => {
  try {
    const tokenDetails = req.userDetails;
    const userId = req.body.id;

    // Validate request user
    const requestUser = await userSchema.findById(tokenDetails.id);
    const oldData = await userSchema.findById(userId);

    if (!oldData) {
      throw new CustomError(ErrorEnums.USER_NOT_FOUND);
    }

    // Prepare fields to update
    const fields = prepareUpdateFields(req, oldData, requestUser);

    // Generate TL ID if needed
    if (fields.role === "TL" && !oldData?.tl_id?.includes("TL")) {
      fields.tl_id = await generateTLId();
      fields.team_leader_id = "";
    }

    // Update user using processor
    const updateOptions = {
      updateCards: tokenDetails.role !== DBEnums.USER_ROLES.USER,
      updateHospitals: tokenDetails.role !== DBEnums.USER_ROLES.USER,
    };
    if (
      oldData.status === DBEnums.USER_STATUS.Incomplete &&
      fields.father_husband_name &&
      fields.dob &&
      tokenDetails.role === DBEnums.USER_ROLES.ADMIN
    ) {
      fields.status = DBEnums.USER_STATUS.Verified;
    } else {
      fields.status = oldData.status;
    }
    const updatedUser = await updateUserById({
      id: userId,
      updatedData: fields,
      rolesAndPermissionsDetails: oldData?.services || [],
      ...updateOptions,
    });

    return res.status(200).json({
      status: "success",
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = updateUserDetailsById;
