const { DBEnums } = require("../../Enums");
const { cardSchema } = require("../../models");
const moment = require("moment");

const durationMapper = {
  TODAY: "day",
  "THIS WEEK": "week",
  "THIS MONTH": "month",
};

const getAvailableCardLocations = async (req, res, next) => {
  try {
    const qry = {
      status: req?.query?.status || DBEnums.CARD_STATUS.SUBMITTED,
      userId: null,
      ...(req.query.state && { state: req.query.state }),
      ...(req.query.district && { district: req.query.district }),
      ...(req.query.tehsil && { tehsil: req.query.tehsil }),
      ...(req.query.created_by && {
        created_by_uid: req.query.created_by,
      }),
      ...(req.query.duration &&
      !req.query.till_duration &&
      durationMapper[req.query.duration]
        ? {
            created_at: {
              $gte: moment()
                .startOf(durationMapper[req.query.duration])
                .valueOf(),
            },
          }
        : {}),
      ...(req.query.duration && req.query.till_duration
        ? {
            created_at: {
              ...(req.query.duration && { $gte: parseInt(req.query.duration) }),
              ...(req.query.till_duration && {
                $lte: parseInt(req.query.till_duration),
              }),
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

    const cardCount = await cardSchema.countDocuments({ userId: null });
    const locationFilterCardCount = await cardSchema.countDocuments({
      status: DBEnums.CARD_STATUS.SUBMITTED,
      userId: null,
    });
    const pendingCardCount = await cardSchema.countDocuments({
      status: DBEnums.CARD_STATUS.PENDING,
      userId: null,
    });
    const cardCountWithFilter = await cardSchema.countDocuments(qry);
    res.status(200).json({
      status: "success",
      data: locations,
      total_print_card: locationFilterCardCount,
      total: cardCount,
      total_showing: 100,
      total_print_card_showing: cardCountWithFilter,
      total_documents_per_page: 55,
      pendingCardCount,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = getAvailableCardLocations;
