const {
  getUser,
  addUser,
  addUserRole,
  getServiceByName,
  updateUserByEmail,
} = require("../../processors");
const { DBEnums, ErrorEnums } = require("../../Enums");
const mongoose = require("mongoose");
const { CustomError } = require("../../utils/custom-errors");

const axios = require("axios");

/**
 * Fetches an image from a source API and sends it to a destination API.
 * @param {string} imageUrl - The URL of the image to fetch.
 * @param {string} uploadUrl - The destination API URL to send the image.
 */
async function fetchAndSendImage({
  email,
  imageUrl,
  uploadUrl = process.env.FILE_UPLOAD_URL,
} = {}) {
  try {
    // Fetch the image from the source API
    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
    // Extract the content type (e.g., image/jpeg, image/png)
    const contentType = response.headers["content-type"];

    // Convert buffer to Blob
    const imageBlob = new Blob([response.data], { type: contentType });

    // Create FormData and append the Blob
    const formData = new FormData();
    formData.append("file", imageBlob, "image.jpg");

    // Send the image to the destination API
    const uploadResponse = await axios.post(uploadUrl, formData);
    let uploadedImageUrl = "";
    if (uploadResponse.data.status === "success") {
      uploadedImageUrl = uploadResponse.data.path;
    }
    await updateUserByEmail({
      email,
      updateFields: { image: uploadedImageUrl },
    });
    console.log("Image sent successfully:", uploadResponse.data);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

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
      if (userDetails.picture) {
        await fetchAndSendImage({
          email: userDetails.email,
          imageUrl: userDetails.picture,
        });
      }
    }
    if (session) {
      await session.commitTransaction();
    }
    callback(null, userDetails);
  } catch (error) {
    if (session) {
      await session.abortTransaction();
    }
    error.redirectUrl = `${process.env.GOOGLE_SIGIN_REDIRECTION_URL}/google-sign-in-error`;
    error.isGoogleLoginError = true;
    callback(error, profile);
  } finally {
    if (session) {
      await session.endSession();
    }
  }
}

module.exports = handleGoogleUserLoginAndsignUp;
