const express = require("express");
const router = express.Router();
const hospitalSch = require("../models/hospital");
const tokenSch = require("../models/token");
const userSch = require("../models/user");

router.get("/", async (req, res) => {
  try {
    if (req.query.token == "arogyam") {
      return res.status(200).json({
        status: "success",
        data: await hospitalSch.find(),
      });
    }
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
    var qry = {};
    if (req.query.q != null) {
      if (
        req.query.q.toString().length == 6 &&
        parseInt(req.query.q.toString()) > 0
      ) {
        qry.pincode = req.query.q;
      } else {
        qry.entity_name = { $regex: req.query.q, $options: "i" };
      }
    }
    if (req.query.state != null) {
      qry.state = req.query.state;
    }
    if (req.query.district != null) {
      qry.district = req.query.district;
    }
    if (req.query.tehsil != null) {
      qry.tehsil = req.query.tehsil;
    }
    if (req.query.type != null) {
      qry["$or"] = [
        { category: req.query.type },
        // { category: "Diagnostic Centre" },
      ];
    }
    if (req.query.mode == "ADMIN") {
      if (req.query.status != null) {
        qry.status = req.query.status;
      }
    } else {
      qry.status = "ENABLE";
    }
    if (req.query.duration != null) {
      console.log(req.query.duration);
      if (req.query.duration == "TODAY") {
        const nowDate = new Date(Date.now());
        qry.created_at = {
          $gte: new Date(
            nowDate.getFullYear(),
            nowDate.getMonth(),
            nowDate.getDate(),
            0,
            0
          ).getTime(),
        };
      } else if (req.query.duration == "THIS WEEK") {
        const nowDate = new Date(Date.now());
        const weekDay = nowDate.getDay();
        qry.created_at = {
          $gte:
            new Date(
              nowDate.getFullYear(),
              nowDate.getMonth(),
              nowDate.getDate(),
              0,
              0
            ).getTime() -
            weekDay * 24 * 60 * 60 * 1000,
        };
      } else if (req.query.duration == "THIS MONTH") {
        const now = new Date(Date.now());
        qry.created_at = {
          $gte: parseInt(
            new Date(now.getFullYear(), now.getMonth(), 1).valueOf()
          ),
        };
      } else if (req.query.duration == "ALL") {
      } else if (
        parseInt(req.query.duration) != null &&
        parseInt(req.query.duration) != NaN
      ) {
        var ltDur =
          parseInt(req.query.till_duration) != null &&
          parseInt(req.query.till_duration) != NaN
            ? parseInt(req.query.till_duration)
            : parseInt(req.query.duration) + 24 * 60 * 60 * 1000;
        qry.created_at = {
          $gte: parseInt(req.query.duration),
          $lte: ltDur,
        };
        console.log(qry);
      }
    }
    const resp = await hospitalSch
      .find(qry)
      .sort({ created_at: -1 })
      .skip(parseInt(req.query.page || 0) * parseInt(req.query.limit || "40"))
      .limit(parseInt(req.query.limit || "40"));
    const totalHosp = await hospitalSch.countDocuments();
    const visible = await hospitalSch.countDocuments(qry);
    return res.status(200).json({
      status: "success",
      page_number: req.query.page || "0",
      total: totalHosp,
      total_results: visible,
      data: resp,
    });
  } catch (err) {
    return res.status(200).json({
      status: "failed",
      message: err.message,
    });
  }
});

router.get("/:id", async (req, res) => {
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
    const resp = await hospitalSch.findById(req.params.id);
    if (resp != null) {
      return res.status(200).json({
        status: "success",
        data: resp,
      });
    } else {
      const respU = await hospitalSch.findOne({ uid: req.params.id });
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
});

router.post("/", async (req, res) => {
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
    const usr = await userSch.findById(token.uid);
    if (usr == null || usr.status != "Verified") {
      return res.status(200).json({
        status: "failed",
        message:
          usr == null ? "Access Denied" : `${usr.status} User: Access Denied`,
      });
    }

    let uuid;
    while (true) {
      var x = (Math.floor(Math.random() * (9999 - 1001 + 1)) + 1001)
        .toString()
        .padStart(4, "0");
      const uid = `${req.body.category
        .toString()
        .toUpperCase()
        .substring(0, 1)}${x}`;
      const qry = await hospitalSch.exists({ uid: uid });
      console.log(qry);
      if (!qry) {
        uuid = uid;
        break;
      }
    }
    const uid = uuid;
    const hsp = hospitalSch({
      state: req.body.state,
      district: req.body.district,
      category: req.body.category,
      entity_name: req.body.entity_name,
      reg_no: req.body.reg_no,
      established_in: req.body.established_in,
      doctors: req.body.doctors,
      basic_facilities: req.body.basic_facilities,
      advance_facilities: req.body.advance_facilities,
      timings: req.body.timings,
      address: req.body.address,
      pincode: req.body.pincode,
      signatureImage: req.body.signatureImage,
      city: req.body.city,
      tel_no: req.body.tel_no,
      mobile_no: req.body.mobile_no,
      email: req.body.email,
      website: req.body.website,
      hospital_rates: req.body.hospital_rates,
      discount_ipd: parseFloat(req.body.discount_ipd),
      discount_opd: parseFloat(req.body.discount_opd),
      discount_medicine: parseFloat(req.body.discount_medicine),
      discount_diagnostic: parseFloat(req.body.discount_diagnostic),
      acknowledge: req.body.acknowledge,
      auth_sign: req.body.auth_sign,
      date_of_agreement: req.body.date_of_agreement,
      images: req.body.images,
      created_by: token.uid,
      created_by_name: usr.name,
      created_by_uid: usr.uid,
      created_at: parseInt(Date.now()),
      start_time: req.body.start_time,
      close_time: req.body.close_time,
      map_link: req.body.map_link,
      status: req.body.status || "ENABLE",
      contactPersonName: req.body.contactPersonName,
      contactPersonPhone: req.body.contactPersonPhone,
      uid: uid,
    });
    const resp = await hsp.save();
    return res.status(200).json({
      status: "success",
      message: "Hospital added successfully",
      data: resp,
    });
  } catch (err) {
    return res.status(200).json({
      status: "failed",
      message: err.message,
    });
  }
});

router.patch("/:id", async (req, res) => {
  res.set("Content-Type", "application/json");
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
    var body = typeof req.body == String ? JSON.parse(req.body) : req.body;
    var fields = {};
    if (body.state != null) {
      fields.state = body.state;
    }
    if (body.images != null) {
      fields.images = body.images;
    }
    if (body.date_of_agreement != null) {
      fields.date_of_agreement = body.date_of_agreement;
    }
    if (body.auth_sign != null) {
      fields.auth_sign = body.auth_sign;
    }
    if (body.district != null) {
      fields.district = body.district;
    }
    if (body.category != null) {
      fields.category = body.category;
    }
    if (body.entity_name != null) {
      fields.entity_name = body.entity_name;
    }
    if (body.reg_no != null) {
      fields.reg_no = body.reg_no;
    }
    if (body.address != null) {
      fields.address = body.address;
    }
    if (body.established_in != null) {
      fields.established_in = body.established_in;
    }
    if (body.doctors != null) {
      fields.doctors = body.doctors;
    }
    if (body.basic_facilities != null) {
      fields.basic_facilities = body.basic_facilities;
    }
    if (body.advance_facilities != null) {
      fields.advance_facilities = body.advance_facilities;
    }
    if (body.timings != null) {
      fields.timings = body.timings;
    }
    if (body.pincode != null) {
      fields.pincode = body.pincode;
    }
    if (body.city != null) {
      fields.city = body.city;
    }
    if (body.tel_no != null) {
      fields.tel_no = body.tel_no;
    }
    if (body.mobile_no != null) {
      fields.mobile_no = body.mobile_no;
    }
    if (body.email != null) {
      fields.email = body.email;
    }
    if (body.website != null) {
      fields.website = body.website;
    }
    if (body.hospital_rates != null) {
      fields.hospital_rates = body.hospital_rates;
    }
    if (body.discount_ipd != null) {
      fields.discount_ipd = parseFloat(body.discount_ipd);
    }
    if (body.discount_opd != null) {
      fields.discount_opd = parseFloat(body.discount_opd);
    }
    if (body.discount_medicine != null) {
      fields.discount_medicine = parseFloat(body.discount_medicine);
    }
    if (body.discount_diagnostic != null) {
      fields.discount_diagnostic = parseFloat(body.discount_diagnostic);
    }
    if (body.acknowledge != null) {
      fields.acknowledge = body.acknowledge;
    }
    if (body.start_time != null) {
      fields.start_time = body.start_time;
    }
    if (body.close_time != null) {
      fields.close_time = body.close_time;
    }
    if (body.map_link != null) {
      fields.map_link = body.map_link;
    }
    if (body.status != null) {
      fields.status = body.status;
    }
    if (body.signatureImage != null) {
      fields.signatureImage = body.signatureImage;
    }
    var id = req.params.id;
    if (id.length == 5) {
      id = (await hospitalSch.findOne({ uid: id }))._id;
    }
    const hosp = await hospitalSch.findByIdAndUpdate(id, fields);
    const rp = await hospitalSch.findById(id);
    return res.status(200).json({
      status: "success",
      message: "Hospital updated successfully",
      data: rp,
    });
  } catch (err) {
    return res.status(200).json({
      status: "failed",
      message: err.message,
    });
  }
});

router.delete("/", async (req, res) => {
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
    const resp = await hospitalSch.findByIdAndDelete(req.body.id);
    if (resp == null) {
      return res.status(200).json({
        status: "failed",
        message: "Hospital not found",
      });
    } else {
      return res.status(200).json({
        status: "success",
        message: "Hospital deleted successfully",
        data: resp,
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
