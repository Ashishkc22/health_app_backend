const { hospitalSchema } = require("../../models");

const getHospitals = async (req, res) => {
  try {
    return res.status(200).json({
      status: "success",
      data: await hospitalSchema.find(),
    });
  } catch (error) {
    return res.status(200).json({
      status: "failed",
      message: error.message,
    });
  }
};

module.exports = getHospitals;
