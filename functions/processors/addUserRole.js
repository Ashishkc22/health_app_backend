const { rolesSchema } = require("../models");
const { DefaultRolePermissions } = require("../Enums");

async function addUserRole({ session, role = "FE" } = {}) {
  try {
    const userRole = rolesSchema(DefaultRolePermissions[role]);
    return await userRole.save(session && { session });
  } catch (error) {
    throw error;
  }
}

module.exports = addUserRole;
