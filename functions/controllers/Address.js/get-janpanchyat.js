const { tehsilSchema } = require("../../models");

const getJanpanchyat = async (req, res) => {
  const tehsils = await tehsilSchema.find({ active: true });

  return res.status(200).json({
    status: "success",
    data: tehsils,
  });
};

module.exports = getJanpanchyat;
