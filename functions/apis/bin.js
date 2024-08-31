const express = require("express");
const router = express.Router();
const tokenSch = require("../models/token");
const userSch = require("../models/user");
const binSch = require("../models/bin");
const cardSch = require("../models/card");
const { isEmpty } = require("lodash");

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
      .find({})
      .sort({ deleted_at: -1 })
      .skip(parseInt(req.query.page || 0) * parseInt(req.query.limit || "50"))
      .limit(parseInt(req.query.limit || "50"));

    const documentCount = await binSch.countDocuments();
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
  } catch (error) {
    return res.status(200).json({
      status: "failed",
      message: error.message,
    });
  }
});

module.exports = router;
