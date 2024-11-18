const cardSch = require("../models/card");
const tokenSch = require("../models/token");
const userSch = require("../models/user");
const areaSch = require("../models/area");
const tehsilSch = require("../models/new_tehsil");

const createCard = async (req, res) => {
  try {
    const token = await tokenSch.findOne({ token: req.query.token || "" });
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
    if (/[0-9]/.test(req.body.name || "")) {
      return res.status(200).json({
        status: "failed",
        message: "Name should not contain numerial values",
      });
    }
    if (!/^-?\d+$/.test(req.body.birth_year || "")) {
      return res.status(200).json({
        status: "failed",
        message: "Year of birth should not contain alphabets",
      });
    }
    let uuid;
    while (true) {
      var x = (Math.floor(Math.random() * (9999999 - 1000001 + 1)) + 1000001)
        .toString()
        .padStart(7, "0");
      const qry = await cardSch.countDocuments({ unique_number: x });
      if ((qry || 0) == 0) {
        uuid = x;
        break;
      }
    }
    var state = req.body.state;
    var district = req.body.district;
    var tehsil = req.body.tehsil;
    var area = req.body.area;
    if (
      (state || "") == "" ||
      (district || "") == "" ||
      (tehsil || "") == "" ||
      (area || "") == ""
    ) {
      state = userr.current_state || state;
      district = userr.current_district || district;
      tehsil = userr.current_tehsil || tehsil;
      area = userr.current_gram_panchayat || area;
    }
    if (
      (state || "") == "" ||
      (district || "") == "" ||
      (tehsil || "") == "" ||
      (area || "") == ""
    ) {
      if ((req.body.address || "") != "") {
        const adrs = req.body.address.toString().split(",");
        state = adrs[4];
        district = adrs[3];
        tehsil = adrs[2];
        area = `${adrs[0]} , ${adrs[1]}`;
      }
    }
    try {
      const gmp = await areaSch.findOne({ name: area.split(",")[1] });
      const ntehsil = await tehsilSch.findOne({ name: tehsil });
      if ((gmp.tehsil || "" != "") && gmp.tehsil != ntehsil._id) {
        return res.status(200).json({
          status: "failed",
          message: "Gram panchayat has different tehsil match",
        });
      } else {
        await areaSch.findByIdAndUpdate(gmp._id, {
          tehsil: ntehsil._id,
        });
        console.log(await areaSch.findById(gmp._id));
      }
    } catch (err) {}
    const issueDate = new Date(parseInt(Date.now()));
    let family_member_details = {};
    if (req.body.card_type === "Family") {
      family_member_details = {
        family_members: req.body.family_members,
      };
    }
    const card = cardSch({
      image: req.body.image,
      birth_year: req.body.birth_year,
      name: req.body.name,
      gender: req.body.gender,
      id_proof: req.body.id_proof,
      state: state,
      district: district,
      tehsil: tehsil,
      area: area,
      // address: req.body.address,
      phone: req.body.phone,
      father_husband_name: req.body.father_husband_name,
      blood_group: req.body.blood_group,
      emergency_contact: req.body.emergency_contact,
      created_by: token.uid,
      created_at: parseInt(Date.now()),
      status: "SUBMITTED",
      expiry_date: parseInt(Date.now()) + 2 * 365 * 24 * 60 * 60 * 1000,
      expiry_years: 2,
      created_by_uid: userr.uid,
      created_by_name: userr.name,
      issue_date: `${issueDate.getDate().toString().padStart(2, "0")}/${(
        issueDate.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}/${issueDate.getFullYear()}`,
      status_history: [
        {
          previous_status: "SUBMITTED",
          updated_status: "SUBMITTED",
          created_at: new Date().valueOf(),
          updated_by: {
            name: userr.name,
            phone: userr.phone,
            uid: userr.uid,
          },
        },
      ],
      status_updated_at: new Date(),
      unique_number: uuid,
      s_no: req.body.s_no || "",
      card_type: req.body.card_type,
      ...family_member_details,
      total_price_before_discount: req.body.total_price_before_discount,
      total_price_after_discount: req.body.total_price_after_discount,
      received_amount: req.body.received_amount,
      remaining_amount: req.body.remaining_amount,
      plan_validity: req.body.plan_validity,
      ...(req.body.abha_id && { abha_id: req.body.abha_id }),
      ...(req.body.notes && { notes: req.body.notes }),
      pwd: req.body.pwd,
    });
    if (card == null) {
      return res.status(200).json({
        status: "failed",
        message: "Invalid Data",
      });
    }
    // const dsb = await dashboard_data.findOne({ uid: usr._id });
    // if (dsb == null) {
    //     await dashboard_data({
    //         rank: await dashboard_data.countDocuments(),
    //         name: usr.name,
    //         location: usr.address,
    //         score: 1,
    //         ratio: 0,
    //         uid: usr._id
    //     }).save();
    // } else {
    //     dsb.score = (dsb.score || 0) + 1;
    //     dsb.name = usr.name;
    //     await dsb.save();
    // }
    const resp = await card.save();
    await userSch.findByIdAndUpdate(userr._id, {
      last_fetch: parseInt(Date.now()),
      $inc: {
        score: 1,
        p2_count: 1,
      },
    });
    return res.status(200).json({
      status: "success",
      message: "Card updated successfully",
      data: resp,
    });
  } catch (err) {
    return res.status(200).json({
      status: "failed",
      message: err.message,
    });
  }
};

module.exports = createCard;
