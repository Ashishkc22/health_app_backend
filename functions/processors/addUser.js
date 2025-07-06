const { userSchema } = require("../models");
const { DBEnums } = require("../Enums");
const { bcrptyPassword } = require("../utils/bcrypt-util");
const addUserRole = require("./addUserRole");
const getServiceByName = require("./getServiceByName");
const { DefaultRolePermissions, ErrorEnums } = require("../Enums");
const { isEmpty } = require("lodash");

async function getUuid({ role = "" } = {}) {
  try {
    let uuid;
    while (true) {
      var x = (Math.floor(Math.random() * (99999 - 10001 + 1)) + 10001)
        .toString()
        .padStart(5, "0");
      const uid = `${role}${x}`;
      const qry = await userSchema.exists({ uid: uid });
      if (!qry) {
        uuid = uid;
        break;
      }
    }
    return uuid;
  } catch (error) {
    throw error;
  }
}

async function addUser({ data = {}, role = "FE", session } = {}) {
  try {
    const uxid = await getUuid({ role });

    const hashedPassword = bcrptyPassword.hashPassword({ text: data.password });

    const roleDetails = await addUserRole({ session, role });
    const service = await getServiceByName({
      name: DefaultRolePermissions.SERVICES.AGENT.name,
    });

    if (isEmpty(service)) {
      throw new CustomError(ErrorEnums.SERVICE_NOT_FOUND);
    }

    const user = userSchema({
      uid: uxid,
      tl_id: uxid,
      name: data.name,
      phone: data.phone,
      ...(data.legalName && { legalName: data.legalName }),
      ...(data.alternate_phone && { alternate_phone: data.alternate_phone }),
      ...(data.passportImage && { passportImage: data.passportImage }),
      ...(data.registrationFormImage && {
        registrationFormImage: data.registrationFormImage,
      }),
      ...(data.agreementImage && { agreementImage: data.agreementImage }),
      ...(data.panCardImage && { panCardImage: data.panCardImage }),
      ...(data.signatureImage && { signatureImage: data.signatureImage }),
      ...(data.janPanchayat && { janPanchayat: data.janPanchayat }),
      password: hashedPassword,
      email: data.email,
      image: data.image,
      address: data.address,
      state: data.state,
      district: data.district,
      id_proof: data.id_proof,
      last_fetch: parseInt(Date.now()),
      emergency_contact: data.emergency_contact,
      team_leader_id: data.team_leader_id,
      device_id: data.device_id,
      created_at: parseInt(Date.now()),
      role: role,
      status: data?.status || DBEnums.USER_STATUS.Unverified,
      lat: parseFloat(data.lat) || 0.0,
      lon: parseFloat(data.lon) || 0.0,
      services: [
        {
          serviceId: service._id,
          roleId: roleDetails._id,
        },
      ],
    });
    return await user.save(session && { session });
  } catch (error) {
    throw error;
  }
}

module.exports = addUser;
