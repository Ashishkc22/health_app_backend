const express = require("express");
const router = express.Router();
const tokenSch = require("../models/token");
const userSch = require("../models/user");
const binSch = require("../models/bin");
const cardSch = require("../models/card");
const hospital = require("../models/hospital");
const { isEmpty } = require("lodash");
const mongoose = require("mongoose");

router.use(async (req, res, next) => {
  if (req.query.token == null) {
    return res.status(200).json({
      status: "failed",
      message: "Invalid Token",
    });
  }
  const token = await tokenSch.findOne({ token: req.query.token });
  if (token == null) {
    return res.status(200).json({
      status: "failed",
      message: "Invalid Token",
    });
  }
  const user = await userSch.findById(token.uid);
  if (user == null || user.status != "Verified") {
    return res.status(200).json({
      status: "failed",
      message:
        user == null ? "Access Denied" : `${user.status} User: Access Denied`,
    });
  }
  next();
});

router.get("/", async (req, res) => {
  try {
    const data = await binSch
      .find({ metaDataName: req.query.type })
      .sort({ deleted_at: -1 })
      .skip(parseInt(req.query.page || 0) * parseInt(req.query.limit || "50"))
      .limit(parseInt(req.query.limit || "50"));

    const documentCount = await binSch.countDocuments({
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
});

router.post("/restore", async (req, res) => {
  try {
    const data = await binSch.findById(req.body.id);
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

      const cardData = new cardSch(newData);
      const restoredCardData = await cardData.save();
      if (!isEmpty(restoredCardData)) {
        console.log("deleting from bin", newData._id);
        await binSch.deleteOne({ _id: newData._id });
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

      const hospitalData = new hospital(newData);
      const restoredCardData = await hospitalData.save();
      if (!isEmpty(restoredCardData)) {
        console.log("deleting from bin", newData._id);
        await binSch.deleteOne({ _id: newData._id });
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
});

// Delete functions
async function deleteCard(req, res) {
  const session = await mongoose.startSession();
  try {
    const cardData = await cardSch.findById(req.body.id || req.query.id);
    if (isEmpty(cardData)) {
      return res.status(200).json({
        status: "failed",
        message: "Card not found",
      });
    }
    session.startTransaction();
    const deletedData = new binSch({
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

    const resp = await cardSch.findByIdAndDelete(
      cardData?._id || req.body.id || req.query.id,
      { session }
    );
    await session.commitTransaction();
    return resp;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  }
}
async function deleteHospital(req, res) {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const hospitalData = await hospital.findById(req.body.id || req.query.id);
    if (isEmpty(hospitalData)) {
      return res.status(200).json({
        status: "failed",
        message: "Card not found",
      });
    }

    const deletedData = new binSch({
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
    const resp = await hospital.findByIdAndDelete(req.body.id || req.query.id, {
      session,
    });
    await session.commitTransaction();
    return resp;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  }
}

const deleteType = {
  card: deleteCard,
  hospital: deleteHospital,
};

router.delete("/:type", async (req, res) => {
  try {
    if (req.query.token == null) {
      return res.status(200).json({
        status: "failed",
        message: "Invalid Token",
      });
    }
    const token = await tokenSch.findOne({ token: req.query.token });
    if (token == null) {
      return res.status(200).json({
        status: "failed",
        message: "Invalid Token",
      });
    }
    const userr = await userSch.findById(token.uid);
    if (userr == null || userr.status != "Verified") {
      return res.status(200).json({
        status: "failed",
        message:
          userr == null
            ? "Access Denied"
            : `${userr.status} User: Access Denied`,
      });
    }

    if (deleteType[req?.params?.type]) {
      const resp = await deleteType[req?.params?.type](req, res);
      if (resp == null) {
        return res.status(200).json({
          status: "failed",
          message: "Card not found",
        });
      } else {
        return res.status(200).json({
          status: "success",
          message: "Card deleted successfully",
          data: resp,
        });
      }
    } else {
      return res.status(200).json({
        status: "failed",
        message: "Invalid delete type.",
      });
    }
  } catch (err) {
    return res.status(200).json({
      status: "failed",
      message: err.message,
    });
  }
});

module.exports = router;
