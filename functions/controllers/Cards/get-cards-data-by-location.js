const { DBEnums } = require("../../Enums");
const { cardSchema } = require("../../models");

const getCardsDataByLocation = async (req, res, next) => {
  try {
    const { q, sortBy, district, tehsil, pagination = {} } = req.query;

    // Build the query object
    let query = {
      status: DBEnums.CARD_STATUS.SUBMITTED,
      userId: null,
      ...(req?.query?.isPrintMode && {
        $or: [{ created_at: { $lt: parseInt(req?.query?.isPrintMode) } }],
      }),
      ...(req.query.state && { state: req.query.state }),
      ...(req.query.district && { district: req.query.district }),
      ...(req.query.tehsil && { tehsil: req.query.tehsil }),
      ...(req.query.created_by && {
        created_by_uid: req.query.created_by,
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

    // Fetch data from the database
    const cards = await cardSchema.aggregate([
      { $match: query },
      { $project: { _id: 1, created_by_uid: 1 } },
      {
        $group: {
          _id: "$created_by_uid",
          count: { $sum: 1 },
          data: { $push: "$_id" },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const cardData = {};
    const paginationData = {};
    for (let i = 0; i < cards.length; i++) {
      const page = 1;
      let limit = 100;
      let skip = (page - 1) * limit;
      if (pagination[cards[i]._id]) {
        limit = pagination[cards[i]._id].limit;
        skip = pagination[cards[i]._id].page * limit;
      }

      cardData[cards[i]._id] = await cardSchema
        .find({
          _id: { $in: cards[i].data },
          ...query,
        })
        .skip(skip)
        .limit(limit);
      paginationData[cards[i]._id] = cards[i].count;
    }

    res.status(200).json({
      status: "success",
      data: cardData,
      paginationData,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = getCardsDataByLocation;
