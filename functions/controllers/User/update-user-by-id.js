const { isEmpty } = require("lodash");
const { updateUserById, getUser } = require("../../processors");
const { CustomError } = require("../../utils/custom-errors");
const { ErrorEnums } = require("../../Enums");
const { userSchema, cardSchema, hospitalSchema } = require("../../models");

const updateUserDetailsById = async (req, res, next) => {
  try {
    const tokenDetails = req.userDetails;

    const requestUser = await userSchema.findById(tokenDetails.id);
    const oldData = await userSchema.findById(req.body.id);
    var fields = {};
    if (req.body.image != null) {
      fields.image = req.body.image;
    }
    if (req.body.passportImage != null) {
      fields.passportImage = req.body.passportImage;
    }
    if (req.body.registrationFormImage != null) {
      fields.registrationFormImage = req.body.registrationFormImage;
    }

    if (req.body.agreementImage != null) {
      fields.agreementImage = req.body.agreementImage;
    }
    if (req.body.panCardImage != null) {
      fields.panCardImage = req.body.panCardImage;
    }
    if (req.body.signatureImage != null) {
      fields.signatureImage = req.body.signatureImage;
    }

    if (req.body.name != null) {
      fields.name = req.body.name;
    }
    if (req.body.phone != null) {
      fields.phone = req.body.phone;
    }
    if (req.body.id_proof != null) {
      fields.id_proof = req.body.id_proof;
    }
    if (req.body.state != null) {
      fields.state = req.body.state;
    }
    if (req.body.district != null) {
      fields.district = req.body.district;
    }
    if (req.body.blood_group != null) {
      fields.blood_group = req.body.blood_group;
    }
    if (req.body.dob != null) {
      fields.dob = req.body.dob;
    }
    if (req.body.password != null) {
      fields.password = req.body.password;
    }
    if (req.body.device_id != null) {
      fields.device_id = req.body.device_id;
    }
    if (req.body.email != null) {
      fields.email = req.body.email;
    }
    if (req.body.address != null) {
      fields.address = req.body.address;
    }
    if (req.body.emergency_contact != null) {
      fields.emergency_contact = req.body.emergency_contact;
    }
    if (req.body.team_leader_id != null) {
      fields.team_leader_id = req.body.team_leader_id;
    }
    if (requestUser.role == "ADMIN") {
      if (req.body.role != null) {
        fields.role = req.body.role;
      }
    }
    if (req.body.status != null) {
      fields.status = req.body.status;
      fields.suspension_reason = req.body.suspension_reason;
    }
    if (req.body.current_state != null) {
      fields.current_state = req.body.current_state;
    }
    if (req.body.current_district != null) {
      fields.current_district = req.body.current_district;
    }
    if (req.body.current_location_type != null) {
      fields.current_location_type = req.body.current_location_type;
    }
    if (req.body.current_janpad != null) {
      fields.current_janpad = req.body.current_janpad;
    }
    if (req.body.current_gram_panchayat != null) {
      fields.current_gram_panchayat = req.body.current_gram_panchayat;
    }
    if (req.body.current_tehsil != null) {
      fields.current_tehsil = req.body.current_tehsil;
    }
    if (req.body.current_pincode != null) {
      fields.current_pincode = req.body.current_pincode;
    }
    if (req.body.current_maplink != null) {
      fields.current_maplink = req.body.current_maplink;
    }
    if (req.body.last_fetch != null) {
      fields.last_fetch = req.body.last_fetch;
    }
    if (req.body.reject_reason != null) {
      fields.reject_reason = req.body.reject_reason;
    }
    if (oldData.tl_id && req.body.role == "TL") {
      fields.team_leader_id = "";
    }
    if (req.body.role == "TL" && (oldData.tl_id || "") == "") {
      let uuid;
      while (true) {
        var x = (Math.floor(Math.random() * (99999 - 10001 + 1)) + 10001)
          .toString()
          .padStart(5, "0");
        const uid = `TL${x}`;
        const qry = await userSchema.exists({ tl_id: uid });
        if (!qry) {
          uuid = uid;
          break;
        }
      }
      fields.team_leader_id = "";
      fields.tl_id = uuid;
    }
    if (req.body.name && oldData.name != req.body.name) {
      await cardSchema.updateMany(
        {
          created_by: req.params.id,
        },
        {
          created_by_name: req.body.name,
        }
      );
      await hospitalSchema.updateMany(
        {
          created_by: req.params.id,
        },
        {
          created_by_name: req.body.name,
        }
      );
    }
    const us = await userSchema.findByIdAndUpdate(req.params.id, fields);
    const user = await userSchema.findById(req.params.id);
    return res.status(200).json({
      status: "success",
      message: "User updated successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = updateUserDetailsById;
