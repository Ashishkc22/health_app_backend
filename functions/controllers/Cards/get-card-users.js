const { cardSchema, tokenSchema } = require("../../models");

const getCardUsers = async (req, res) => {
  try {
    const userList =
      (await cardSchema.aggregate([
        ...(req.query.status
          ? [
              {
                $match: {
                  status: { $in: ["REPRINT", "SUBMITTED"] },
                },
              },
            ]
          : []),
        {
          $group: {
            _id: "$created_by",
            count: { $sum: 1 },
          },
        },
        // {
        //   $unwind: {
        //     path: "$userIds",
        //   },
        // },
        {
          $lookup: {
            from: "users",
            let: { userIds: { $toObjectId: "$_id" } },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$_id", "$$userIds"] }, // Match the converted ObjectId
                },
              },
              {
                $project: {
                  _id: "$_id",
                  name: "$name",
                  uid: "$uid",
                },
              },
            ],
            as: "userDetails",
          },
        },
        {
          $project: {
            userDetails: { $arrayElemAt: ["$userDetails", 0] },
            count: 1,
          },
        },

        {
          $replaceRoot: {
            newRoot: {
              $mergeObjects: ["$userDetails", { count: "$count" }],
            },
          },
        },
        {
          $sort: {
            name: 1,
            // count: -1,
          },
        },
      ])) || [];
    return res.status(200).json({
      status: "success",
      userList: userList,
    });
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: "Something went wrong while getting users.",
    });
  }
};

module.exports = getCardUsers;
