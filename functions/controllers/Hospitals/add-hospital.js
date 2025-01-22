const { userSchema, hospitalSchema } = require("../../models");

const addHospital = async (req, res) => {
  try {
    const userDetails = req.userDetails;

    const usr = await userSchema.findById(userDetails.id);
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
      const qry = await hospitalSchema.exists({ uid: uid });
      console.log(qry);
      if (!qry) {
        uuid = uid;
        break;
      }
    }
    const uid = uuid;
    const hsp = hospitalSchema({
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
      created_by: req.userDetails.id,
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
};

module.exports = addHospital;
