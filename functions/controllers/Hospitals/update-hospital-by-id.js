const { hospitalSchema, userSchema } = require("../../models");

const updateHospitalById = async (req, res) => {
  res.set("Content-Type", "application/json");
  try {
    const userr = await userSchema.findById(req.userDetails.id);
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
    var id = req.body.id;
    if (id.length == 5) {
      id = (await hospitalSchema.findOne({ uid: id }))._id;
    }
    const hosp = await hospitalSchema.findByIdAndUpdate(id, fields);
    const rp = await hospitalSchema.findById(id);
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
};
module.exports = updateHospitalById;
