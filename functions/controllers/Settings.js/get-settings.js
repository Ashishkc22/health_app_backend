const { settingSchema } = require("../../models");

const getSettings = async (req, res) => {
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
    return res.status(200).json({
      status: "failed",
      message: "Failed to get settings",
    });
  }
};

module.exports = getSettings;
