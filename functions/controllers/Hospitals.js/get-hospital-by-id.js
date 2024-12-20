const { hospitalSchema } = require("../../models");

const getHospitalById = async (req, res) => {
  try {
    const resp = await hospitalSchema.findById(req.query.id);
    if (resp != null) {
      return res.status(200).json({
        status: "success",
        data: resp,
      });
    } else {
      const respU = await hospitalSchema.findOne({ uid: req.query.id });
      if (respU != null) {
        return res.status(200).json({
          status: "success",
          data: respU,
        });
      }
      return res.status(200).json({
        status: "failed",
        message: "Hospital not found",
      });
    }
  } catch (err) {
    return res.status(200).json({
      status: "failed",
      message: err.message,
    });
  }
};

module.exports = getHospitalById;
