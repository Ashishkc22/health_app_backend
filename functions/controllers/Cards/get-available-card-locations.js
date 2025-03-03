const { DBEnums } = require("../../Enums");
const { cardSchema } = require("../../models");

const getAvailableCardLocations = async (req, res) => {
  try {
    const qry = {
      status: req?.query?.status || DBEnums.CARD_STATUS.SUBMITTED,
      userId: null,
      ...(req.query.state && { state: req.query.state }),
      ...(req.query.district && { district: req.query.district }),
      ...(req.query.tehsil && { tehsil: req.query.tehsil }),
      ...(req.query.created_by_uid && {
        created_by_uid: req.query.created_by_uid,
      }),

      ...(req.query.from || req.query.to
        ? {
            created_at: {
              ...(req.query.from && { $gte: parseInt(req.query.from) }),
              ...(req.query.to && { $lte: parseInt(req.query.to) }),
            },
          }
        : {}),

      ...(req.query.q?.trim() && {
        $or: [
          { name: { $regex: req.query.q.trim(), $options: "i" } },
          ...(!isNaN(req.query.q)
            ? [{ unique_number: req.query.q }, { phone: req.query.q }]
            : []),
        ],
      }),
    };

    const locations = await cardSchema.aggregate([
      {
        $match: qry,
      },
      {
        $group: {
          _id: {
            district: "$district",
            tehsil: "$tehsil",
          },
          createByUids: { $addToSet: "$created_by_uid" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    res.status(200).json({
      status: "success",
      data: locations,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = getAvailableCardLocations;
