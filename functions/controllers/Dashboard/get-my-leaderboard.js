const { DBEnums } = require("../../Enums");
const { userSchema } = require("../../models");
const moment = require("moment");

const getMyLeaderboard = async (req, res, next) => {
  try {
    const { role, team_leader_id } = req.userDetails;

    const dateTimeMap = {
      TODAY: moment().startOf("day").valueOf(),
      "THIS WEEK": moment().startOf("week").valueOf(),
      "THIS MONTH": moment().startOf("month").valueOf(),
    };

    if (!req.query.period) {
      req.query.period = "TODAY";
    }
    const cardCreatedAt = req.query.period
      ? dateTimeMap[req.query.period]
      : null;
    if (role === DBEnums.USER_ROLES.FE) {
      const leaderboardData = await userSchema.aggregate([
        {
          $match: {
            role: DBEnums.USER_ROLES.FE,
            team_leader_id: team_leader_id,
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            district: 1,
          },
        },
        {
          $lookup: {
            from: "cards",
            let: { userId: { $toString: "$_id" } },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$created_by", "$$userId"] },
                  ...(cardCreatedAt && { created_at: { $gte: cardCreatedAt } }),
                },
              },
              {
                $group: {
                  _id: null,
                  deliveredCount: {
                    $sum: {
                      $cond: [{ $eq: ["$status", "DELIVERED"] }, 1, 0],
                    },
                  },
                  totalCount: { $sum: 1 },
                },
              },
              {
                $addFields: {
                  ratio: { $divide: ["$deliveredCount", "$totalCount"] },
                },
              },
            ],
            as: "card",
          },
        },
        { $match: { card: { $ne: [] } } },
        { $addFields: { card: { $arrayElemAt: ["$card", 0] } } },
        { $sort: { "card.ratio": -1, "card.totalCount": -1 } },
      ]);

      res.status(200).json({
        status: "success",
        data: leaderboardData,
      });
    } else {
      const leaderboard = await userSchema.aggregate([
        {
          $match: {
            team_leader_id: { $ne: "" },
            district: { $ne: null },
          },
        },
        {
          $group: {
            _id: {
              team_leader_id: "$team_leader_id",
              district: "$district",
            },
            userIds: { $push: { $toString: "$_id" } },
          },
        },
        {
          $lookup: {
            from: "cards",
            let: { userId: "$userIds" },
            pipeline: [
              {
                $match: {
                  $expr: { $in: ["$created_by", "$$userId"] },
                  ...(cardCreatedAt && { created_at: { $gte: cardCreatedAt } }),
                },
              },
              {
                $project: { _id: 1, status: 1 },
              },
              {
                $group: {
                  _id: null,
                  deliveredCount: {
                    $sum: {
                      $cond: [{ $eq: ["$status", "DELIVERED"] }, 1, 0],
                    },
                  },
                  totalCount: { $sum: 1 },
                },
              },
              {
                $addFields: {
                  ratio: { $divide: ["$deliveredCount", "$totalCount"] },
                },
              },
            ],
            as: "card",
          },
        },
        { $match: { card: { $ne: [] } } },
        { $addFields: { card: { $arrayElemAt: ["$card", 0] } } },
      ]);
      res.status(200).json({
        status: "success",
        data: leaderboard,
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = getMyLeaderboard;
