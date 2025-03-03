const district = require("../../models/district");

const getCardsDataByLocation = async (req, res) => {
  try {
    const { q, sortBy, isPrintMode, page = 1, limit = 10 } = req.query;

    // Build the query object
    let query = {
      ...(req?.query?.location?.district && {
        district: req?.query?.location?.district,
      }),
      ...(req?.query?.location?.tehsil && {
        tehsil: req?.query?.location?.tehsil,
      }),
      ...(req?.query?.isPrintMode && {
        $or: [{ created_at: { $lt: parseInt(req?.query?.isPrintMode) } }],
      }),
    };
    if (q) {
      query.$text = { $search: q };
    }

    // Set sorting options
    let sortOptions = {};
    if (sortBy) {
      sortOptions[sortBy] = 1; // 1 for ascending order
    }

    // Pagination options
    const skip = (page - 1) * limit;

    // Fetch data from the database
    const cards = await Card.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    // If print mode is enabled, format the data accordingly
    if (isPrintMode) {
      // Implement print mode formatting if needed
    }

    res.status(200).json({
      status: "success",
      data: cards,
      page,
      limit,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = getCardsDataByLocation;
