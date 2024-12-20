const { binSchema } = require("../../models");

const getBinData = async (req, res) => {
  try {
    const data = await binSchema
      .find({ metaDataName: req.query.type })
      .sort({ deleted_at: -1 })
      .skip(parseInt(req.query.page || 0) * parseInt(req.query.limit || "50"))
      .limit(parseInt(req.query.limit || "50"));

    const documentCount = await binSchema.countDocuments({
      metaDataName: req.query.type,
    });
    return res.status(200).json({
      status: "success",
      docCount: documentCount,
      data: data,
    });
  } catch (error) {
    return res.status(200).json({
      status: "failed",
      message: err.message,
    });
  }
};
module.exports = getBinData;
