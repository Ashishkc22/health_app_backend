const { isEmpty } = require("lodash");
const { updateUserById, getUser } = require("../../processors");
const { CustomError } = require("../../utils/custom-errors");
const { ErrorEnums, DBEnums } = require("../../Enums");
const { userSchema } = require("../../models");

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
    if (fields.role === "TL" && (!oldData.tl_id || oldData.tl_id === "")) {
      fields.tl_id = await generateTLId();
      fields.team_leader_id = "";
    }

    // Update user using processor
    const updateOptions = {
      updateCards: tokenDetails.role !== DBEnums.USER_ROLES.USER,
      updateHospitals: tokenDetails.role !== DBEnums.USER_ROLES.USER
    };
    if(oldData.status === DBEnums.USER_STATUS.Incomplete && fields.father_husband_name && fields.dob) {
      fields.status = DBEnums.USER_STATUS.Verified;
    }
    const updatedUser = await updateUserById({ 
      id: userId, 
      updatedData: fields,
      ...updateOptions
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

// Helper function to prepare update fields based on user roles
function prepareUpdateFields(req, oldData, requestUser) {
  const fields = {};
  
  // Define field update permissions based on user roles
  const roleBasedFieldUpdates = {
    'ADMIN': [
      'name', 'phone', 'email', 'role', 'status', 'suspension_reason', 
      'image', 'passportImage', 'registrationFormImage', 'agreementImage', 
      'panCardImage', 'signatureImage', 'id_proof', 'address', 
      'emergency_contact', 'blood_group', 'dob', 'state', 'district',
      'current_state', 'current_district', 'current_location_type', 
      'current_janpad', 'current_gram_panchayat', 'current_tehsil', 
      'current_pincode', 'current_maplink'
    ],
    'TL': [
      'name', 'phone', 'email', 'image', 'passportImage', 
      'registrationFormImage', 'agreementImage', 'panCardImage', 
      'signatureImage', 'id_proof', 'address', 'emergency_contact', 
      'blood_group', 'dob', 'state', 'district'
    ],
    'USER': [
      'name', 'phone', 'email', 'image', 
      'emergency_contact', 'blood_group', 'dob'
    ]
  };

  // Get allowed fields based on user role
  const allowedFields = roleBasedFieldUpdates[requestUser.role] || 
                        roleBasedFieldUpdates['USER'];

  // Add fields from request body if they are allowed and not null
  allowedFields.forEach(field => {
    if (req.body[field] != null) {
      fields[field] = req.body[field];
    }
  });

  // Special handling for specific scenarios
  if (requestUser.role === 'ADMIN') {
    // Admin can change role
    if (req.body.role != null) {
      fields.role = req.body.role;
    }
    
    // Admin can update status and suspension reason
    if (req.body.status != null) {
      fields.status = req.body.status;
      fields.suspension_reason = req.body.suspension_reason || '';
    }
  }

  // Handle Team Leader specific logic
  if (req.body.role === 'TL') {
    // Remove team leader ID if changing to TL
    if (oldData.tl_id && req.body.role === 'TL') {
      fields.team_leader_id = '';
    }
  }

  // Prevent changing critical fields for non-admin users
  if (requestUser.role !== 'ADMIN') {
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

module.exports = updateUserDetailsById;