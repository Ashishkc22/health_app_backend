const { binSchema, cardSchema, hospitalSchema } = require("../../models");
const { isEmpty } = require("lodash");
const restoreBinData = async (req, res) => {
  try {
    const data = await binSchema.findById(req.body.id);
    if (!data) {
      return res.status(404).json({
        status: "failed",
        message: "Document not found",
      });
    }

    if (data.metaDataName === "Card") {
      // Convert the document to a plain JavaScript object
      const newData = data.toObject();
      // Reset the version key to avoid conflicts
      newData.__v = 0;

      const cardData = new cardSchema(newData);
      const restoredCardData = await cardData.save();
      if (!isEmpty(restoredCardData)) {
        console.log("deleting from bin", newData._id);
        await binSchema.deleteOne({ _id: newData._id });
      }
      return res.status(200).json({
        status: "success",
        data: restoredCardData,
      });
    } else {
      // Convert the document to a plain JavaScript object
      const newData = data.toObject();
      // Reset the version key to avoid conflicts
      newData.__v = 0;

      const hospitalData = new hospitalSchema(newData);
      const restoredCardData = await hospitalData.save();
      if (!isEmpty(restoredCardData)) {
        console.log("deleting from bin", newData._id);
        await binSchema.deleteOne({ _id: newData._id });
      }
      return res.status(200).json({
        status: "success",
        data: restoredCardData,
      });
    }
  } catch (error) {
    return res.status(200).json({
      status: "failed",
      message: error.message,
    });
  }
};

module.exports = restoreBinData;
