const { userSchema } = require("../../models");
const mongoose = require("mongoose");
const { CustomError } = require("../../utils/custom-errors");
const { ErrorEnums, DefaultRolePermissions, DBEnums } = require("../../Enums");
const {
  addUser,
  addUserRole,
  getUser,
  getServiceByName,
} = require("../../processors");
const { isEmpty } = require("lodash");
module.exports = async (req, res) => {
  let session = {};
  try {
    // check if user with email or phone exists
    const user = await getUser({
      email: req.body.email,
      phone: req.body.phone,
    });
    if (!isEmpty(user)) {
      throw new CustomError(ErrorEnums.USER_ALREADY_EXISTS);
    }

    session = await mongoose.startSession();
    session.startTransaction();

    const roleDetails = await addUserRole({ session, role: "TL" });
    const service = await getServiceByName({
      name: DefaultRolePermissions.SERVICES.AGENT.name,
    });
    if (isEmpty(service)) {
      throw new CustomError(ErrorEnums.SERVICE_NOT_FOUND);
    }

    const userData = await addUser({
      data: {
        name: req.body.name,
        legalName: req.body.legalName,
        phone: req.body.phone,
        alternate_phone: req.body.alternatePhone,
        password: req.body.password,
        email: req.body.email,
        image: req.body.image,
        address: req.body.address,
        state: req.body.state,
        district: req.body.district,
        janPanchayat: req.body.janPanchayat,
        id_proof: req.body.id_proof,
        passportImage: req.body.passportImage,
        registrationFormImage: req.body.registrationFormImage,
        agreementImage: req.body.agreementImage,
        panCardImage: req.body.panCardImage,
        signatureImage: req.body.signatureImage,
        lat: req.body.lat,
        lon: req.body.lon,
        services: [
          {
            serviceId: service._id,
            roleId: roleDetails._id,
          },
        ],
      },
      role: DBEnums.USER_ROLES.TL,
      session,
    });

    await session.commitTransaction();

    delete userData.password;

    return res.status(200).json({
      status: "success",
      data: userData,
    });
  } catch (err) {
    console.log(`ERROR: ${err.message}`);
    return res.status(200).json({
      status: "failed",
      message: "Invalid Data",
    });
  }
};
