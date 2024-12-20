const { userSchema } = require("../models");
const { Types } = require("mongoose");

const getUsersRoleAndServiceDetails = async ({ userId = "" }) => {
  try {
    return await userSchema.aggregate([
      {
        $match: {
          _id: Types.ObjectId(userId),
        },
      },
      {
        $project: {
          services: 1,
        },
      },
      {
        $unwind: "$services",
      },
      {
        $lookup: {
          from: "services",
          localField: "services.serviceId",
          foreignField: "_id",
          as: "serviceDetails",
        },
      },
      {
        $lookup: {
          from: "roles",
          localField: "services.roleId",
          foreignField: "_id",
          as: "roleDetails",
        },
      },
      {
        $project: {
          _id: 0,
          serviceDetails: { $arrayElemAt: ["$serviceDetails", 0] },
          roleDetails: { $arrayElemAt: ["$roleDetails", 0] },
        },
      },
    ]);
  } catch (error) {
    throw error;
  }
};

module.exports = getUsersRoleAndServiceDetails;
