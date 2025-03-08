const { DBEnums } = require("../../Enums");
const { cardSchema } = require("../../models");

const getCardsData = async (req, res, next) => {
  try {
    const {
      q,
      sortBy,
      district,
      tehsil,
      limit = 100,
      page = 0,
      status,
    } = req.query;

    // Build the query object
    let query = {
      status: status || DBEnums.CARD_STATUS.SUBMITTED,
      userId: null,
      ...(district && {
        district: district,
      }),
      ...(tehsil && {
        tehsil: tehsil,
      }),
      ...(req?.query?.isPrintMode && {
        $or: [{ created_at: { $lt: parseInt(req?.query?.isPrintMode) } }],
      }),
    };
    if (q) {
      query.$text = { $search: q };
    }

    let skip = Number(page) * Number(limit);

    // Fetch data from the database
    const cards = await cardSchema
      .find(query)
      .sort(sortBy)
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      status: "success",
      data: cards,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = getCardsData;
