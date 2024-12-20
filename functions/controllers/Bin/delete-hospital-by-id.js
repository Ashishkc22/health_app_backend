const { hospitalSchema, binSchema } = require("../../models");
const mongoose = require("mongoose");
const { isEmpty } = require("lodash");

async function deleteHospital(req, res) {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const hospitalData = await hospitalSchema.findById(
      req.body.id || req.query.id
    );
    if (isEmpty(hospitalData)) {
      return res.status(200).json({
        status: "failed",
        message: "Card not found",
      });
    }

    const deletedData = new binSchema({
      ...hospitalData.toObject(),
      metaDataName: "Hospital",
      deleted_at: new Date(),
    });
    const deeletedData = await deletedData.save({ session });
    if (!deeletedData) {
      return res.status(200).json({
        status: "failed",
        message: "Hospital not found",
      });
    }
    const resp = await hospitalSchema.findByIdAndDelete(
      req.body.id || req.query.id,
      {
        session,
      }
    );
    await session.commitTransaction();
    return res.status(200).json({
      status: "success",
      data: resp,
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  }
}

module.exports = deleteHospital;
