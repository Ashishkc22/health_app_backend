const express = require("express");
const router = express.Router();
const settingSchema = require("../models/setting");

router.get("/", async (req, res) => {
  try {
    const sts = await settingSchema.findOne();
    if (req.query.responseType == "ADMIN") {
      return res.status(200).json({
        status: "success",
        data: sts,
      });
    }
    var resp = {};
    resp.hospital_category = sts.hospital_category
      .filter((e) => e.active || false)
      .map((e) => e.name);
    resp.doctor_specialization = sts.doctor_specialization
      .filter((e) => e.active || false)
      .map((e) => e.name);
    resp.basic_facilities = sts.basic_facilities
      .filter((e) => e.active || false)
      .map((e) => e.name);
    resp.advance_facilities = sts.advance_facilities
      .filter((e) => e.active || false)
      .map((e) => e.name);
    resp.hospital_rates = sts.hospital_rates
      .filter((e) => e.active || false)
      .map((e) => e.name);
    resp.tele_gram = sts.tele_gram;
    resp.contact_us = sts.contact_us;
    resp.youtube = sts.youtube;
    resp.whatsapp = sts.whatsapp;
    resp.ig = sts.ig;
    resp.fb = sts.fb;
    resp.tw = sts.tw;
    resp._id = sts._id;
    return res.status(200).json({
      status: "success",
      data: resp,
    });
  } catch (err) {
    console.log(err.message);
    return res.status(200).json({
      status: "failed",
      message: "Failed to get settings",
    });
  }
});

router.post("/", async (req, res) => {
  console.log(req.body);
  try {
    const sts = new settingSchema({
      // tehsil: Array.from(req.body.tehsil || []),
      // district: Array.from(req.body.district || []),
      // state: Array.from(req.body.state || []),
      // area: Array.from(req.body.area || []),
      hospital_category: req.body.hospital_category,
      doctor_specialization: req.body.doctor_specialization,
      basic_facilities: req.body.basic_facilities,
      advance_facilities: req.body.advance_facilities,
      hospital_rates: req.body.hospital_rates,
      tele_gram: req.body.tele_gram,
      contact_us: req.body.contact_us,
      youtube: req.body.youtube,
      whatsapp: req.body.whatsapp,
      ig: req.body.ig,
      fb: req.body.fb,
      tw: req.body.tw,
    });
    const ex = await settingSchema.findById(req.body?._id || req.body?.id);
    if (ex == null) {
      const resp = await sts.save();
      return res.status(200).json({
        status: "success",
        message: "Settings created successfully!",
        data: resp,
      });
    } else {
      const resp = await settingSchema.findByIdAndUpdate(
        req.body?._id || req.body.id,
        {
          hospital_category: req.body.hospital_category,
          doctor_specialization: req.body.doctor_specialization,
          basic_facilities: req.body.basic_facilities,
          advance_facilities: req.body.advance_facilities,
          hospital_rates: req.body.hospital_rates,
          tele_gram: req.body.tele_gram,
          contact_us: req.body.contact_us,
          youtube: req.body.youtube,
          whatsapp: req.body.whatsapp,
          ig: req.body.ig,
          fb: req.body.fb,
          tw: req.body.tw,
        },
        { upsert: true }
      );
      return res.status(200).json({
        status: "success",
        message: "Settings updated successfully!",
        data: resp,
      });
    }
  } catch (err) {
    console.log(`ERROR: ${err.message}`);
    return res.status(200).json({
      status: "failed",
      message: "Invalid Data",
    });
  }
});

module.exports = router;
