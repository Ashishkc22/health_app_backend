const userSchema = require("../../models/user");

const getCustomers = async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;
  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    sort: { _id: -1 },
  };
  try {
    const customers = await userSchema
      .find({ role: "USER" },{ name: 1,email:1,status:1 })
      .skip((options.page - 1) * options.limit)
      .limit(options.limit)
      .sort({ _id: -1 });
    const total = await userSchema.countDocuments({ role: "USER" });
    const pages = Math.ceil(total / options.limit);
    const count = await userSchema.countDocuments({ role: "USER" });
    return res.status(200).json({
      status: "success",
      data: customers,
      total,
      pages,
      page: options.page,
      limit: options.limit,
      total_results: count,
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    next(error);
  }
};

module.exports = getCustomers;
