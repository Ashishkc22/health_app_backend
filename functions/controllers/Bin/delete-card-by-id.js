const { cardSchema, binSchema } = require("../../models");
const mongoose = require("mongoose");
const { isEmpty } = require("lodash");
// Delete functions
async function deleteCard(req, res) {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const cardData = await cardSchema.findById(req.body.id || req.query.id);
    if (isEmpty(cardData)) {
      return res.status(200).json({
        status: "failed",
        message: "Card not found",
      });
    }
    const deletedData = new binSchema({
      _id: cardData._id,
      image: cardData.image,
      name: cardData.name,
      birth_year: cardData.birth_year,
      gender: cardData.gender,
      id_proof: cardData.id_proof,
      state: cardData.state,
      district: cardData.district,
      tehsil: cardData.tehsil,
      area: cardData.area,
      phone: cardData.phone,
      father_husband_name: cardData.father_husband_name,
      blood_group: cardData.blood_group,
      emergency_contact: cardData.emergency_contact,
      status: cardData.status,
      created_by: cardData.created_by,
      created_by_uid: cardData.created_by_uid,
      created_at: cardData.created_at,
      issue_date: cardData.issue_date,
      unique_number: cardData.unique_number,
      expiry_date: cardData.expiry_date,
      expiry_years: cardData.expiry_years,
      s_no: cardData.s_no,
      __v: cardData.__v,
      discard_reason: cardData.discard_reason,
      metaDataName: "Card",
      deleted_at: new Date(),
    });
    const deeletedData = await deletedData.save({ session });
    if (!deeletedData) {
      return res.status(200).json({
        status: "failed",
        message: "Card not found",
      });
    }

    const resp = await cardSchema.findByIdAndDelete(
      cardData?._id || req.body.id || req.query.id,
      { session }
    );
    await session.commitTransaction();
    return res.status(200).json({
      status: "success",
      data: resp,
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

module.exports = deleteCard;
