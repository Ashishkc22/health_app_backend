const {
  getUser,
  addUser,
  addUserRole,
  getServiceByName,
} = require("../../processors");
const { DBEnums, ErrorEnums } = require("../../Enums");
const mongoose = require("mongoose");
const { CustomError } = require("../../utils/custom-errors");

async function handleGoogleUserLoginAndsignUp(
  accessToken,
  refreshToken,
  profile,
  callback
) {
  let session;
  try {
    const userDetails = profile._json;
    const existingUser = await getUser({ email: userDetails.email });
    if (!existingUser) {
      session = await mongoose.startSession();
      session.startTransaction();
      // add role and permissions for that user. //role USER
      const roleDetails = await addUserRole({
        role: DBEnums.USER_ROLES.USER,
        session,
      });
      const serviceDetails = await getServiceByName({
        name: DBEnums.USER_ROLES.USER,
      });
      if (!serviceDetails) {
        throw new CustomError(ErrorEnums.SERVICE_NOT_FOUND);
      }
      if (!roleDetails) {
        throw new Error(ErrorEnums.FAILED_TO_CREATE_ROLE.description);
      }
      // add user detials
      const user = await addUser({
        data: {
          email: userDetails.email,
          name:
            userDetails.name ||
            userDetails.given_name ||
            userDetails.family_name,
          image: userDetails.picture,
          status: DBEnums.USER_STATUS.Incomplete,
          services: [
            {
              serviceId: serviceDetails._id,
              roleId: roleDetails._id,
            },
          ],
        },
        role: DBEnums.USER_ROLES.USER,
        session,
      });
    }
    if (session) {
      await session.commitTransaction();
    }
    callback(null, userDetails);
  } catch (error) {
    if (session) {
      await session.abortTransaction();
    }
    error.redirectUrl = "http://localhost:5173/google-sign-in-error";
    error.isGoogleLoginError = true;
    callback(error, profile);
  } finally {
    if (session) {
      await session.endSession();
    }
  }
}

module.exports = handleGoogleUserLoginAndsignUp;
