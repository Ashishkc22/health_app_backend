const mongoose = require("mongoose");
const userSch = require("../models/user");
const rolesSchema = require("../models/roles");
const cardSchema = require("../models/card");
const hospitalSchema = require("../models/hospital");
const { DefaultRolePermissions, DBEnums } = require("../Enums");
const { isEmpty } = require("lodash");

async function updateUserById({
  id,
  updatedData = {},
  updateCards = true,
  updateHospitals = true,
  useUserId = false,
  rolesAndPermissionsDetails = [],
} = {}) {
  const session = await mongoose.startSession();

  try {
    if (!id) {
      throw new Error("Missing user Id.");
    }

    // Start transaction
    await session.startTransaction();

    // Update user
    const updatedUser = await userSch.findByIdAndUpdate(id, updatedData, {
      session,
    });

    // If role is updating then assign permission accordingly
    if (updatedData.role) {
      let permissionDetails = {};
      if (updatedData.role === DBEnums.USER_ROLES.FE) {
        permissionDetails = DefaultRolePermissions.FE;
      } else if (updatedData.role === DBEnums.USER_ROLES.TL) {
        permissionDetails = DefaultRolePermissions.TL;
      } else if (updatedData.role === DBEnums.USER_ROLES.SUBADMIN) {
        permissionDetails = DefaultRolePermissions.SUBADMIN;
      }
      if (!isEmpty(permissionDetails)) {
        const [services = {}] = updatedUser?.services || [];
        if (services.roleId) {
          await rolesSchema.findOneAndUpdate(
            {
              _id: services.roleId,
            },
            {
              $set: {
                name: permissionDetails.name,
                permissions: permissionDetails.permissions,
              },
            },
            { session }
          );
        }
      }
    }

    // If name is present in updatedData, update related cards and hospitals
    if (updatedData.name) {
      // Update all cards created by this user
      if (updateCards) {
        await cardSchema.updateMany(
          { ...(useUserId ? { userId: id } : { created_by: id }) },
          {
            ...(useUserId
              ? { name: updatedData.name }
              : { created_by_name: updatedData.name }),
          },
          { session }
        );
      }
      if (updateHospitals) {
        await hospitalSchema.updateMany(
          { created_by: id },
          { created_by_name: updatedData.name },
          { session }
        );
      }
    }

    // Commit transaction
    await session.commitTransaction();

    return updatedUser;
  } catch (error) {
    // Abort transaction if there's an error
    await session.abortTransaction();
    console.error("Failed in update user by id processor", error.message);
    throw error;
  } finally {
    // End session
    session.endSession();
  }
}

module.exports = updateUserById;
