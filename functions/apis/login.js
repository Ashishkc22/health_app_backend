const express = require("express");
const router = express.Router();
const userSch = require("../models/user");
const hospitalSch = require("../models/hospital");
const cardSch = require("../models/card");
const tokenSch = require("../models/token");

const otpSch = require("../models/otp");
// const UuidEncoder = require('uuid-encoder');
const TokenGenerator = require("uuid-token-generator");
// const statesSch = require('../models/states');
// const districtSch = require('../models/district');

const nodemailer = require("nodemailer");

const { google } = require("googleapis");

// Mine
const REFRESH_TOKEN =
  "1//04W0-XturEsn0CgYIARAAGAQSNwF-L9Irzm8lb8j2bP2GESLswof45voCPOL1vOkEu1u0rUG9EMlnmw_4vyYVX3DaDRqbx1qWG2A";
const CLIENT_SECRET = "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";
const CLIENT_ID =
  "115159090680-2ddeoqnouv0l44g5sabpgmn9hjalfepv.apps.googleusercontent.com";
const REDIRECT_URI = "https://developers.google.com/oauthplayground";
const MY_EMAIL = "ashishchoudhari224@gmail.com";

// const CLIENT_ID =
//   "563351002803-i9oiegg9c749h95qp8qtbmrj6gk32hhc.apps.googleusercontent.com";
// const CLIENT_SECRET = "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";
// const REDIRECT_URI = "https://developers.google.com/oauthplayground";
// const REFRESH_TOKEN =
//   "1//04HAeyq8OfVS7CgYIARAAGAQSNwF-L9IruBxlCetdt2gD0YPDo5urrYW-Heovu213b1iDcN9cfVJkazT-TQvetT_2ruGU5mDk-uQ";

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const phoneRegex = /^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
const userUIDRegex = /^[A-Z]{2}\d{5}$/;

const appName = "Aarogyam";
const appId = "aarogyam";
const senderEmail = "aarogyam7r@gmail.com";

router.post("/login", async (req, res) => {
  // try {
  const userAgent = req.headers["user-agent"];
  console.log("User-Agent:", userAgent);
  const ipAddress =
    req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  console.log("IP Address:", ipAddress);
  const usr = await userSch.findOne(
    req.body.role == "ADMIN"
      ? {
          email: req.body.email,
          $or: [{ role: "ADMIN" }, { role: "SUBADMIN" }],
        }
      : { phone: req.body.phone }
  );
  if (usr == null) {
    console.log("NO USER");
    return res.status(200).json({
      status: "failed",
      message: "User not exists",
    });
  }
  if (usr.status == "SUSPEND") {
    return res.status(200).json({
      status: "failed",
      message: "User is suspended!",
    });
  }

  if (usr.password == req.body.password) {
    console.log("SUCCESS");
    //create user token and store in user document
    const tokgen = new TokenGenerator(); // Default is a 128-bit token encoded in base58
    const tkn = tokgen.generate();
    // const encoder = new UuidEncoder('base64');
    // const tc = encoder.encode(tkn);
    //.....
    console.log("usr", usr);
    if (
      req.body.role == "ADMIN" &&
      usr.role != "ADMIN" &&
      usr.role != "SUBADMIN"
    ) {
      return res.status(200).json({
        status: "failed",
        message: "Unauthorized Access",
      });
    }
    const tks = await tokenSch
      .findOne({
        uid: usr._id,
      })
      .sort({ _id: -1 });
    if (tks && (tks.userAgent !== userAgent || tks.clientIp != ipAddress)) {
      // await tokenSch.deleteOne({ _id: tks._id });
      console.log("tks", tks);
    }
    // for (let t of tks) {
    //     await t.remove();
    // }
    const tokenS = tokenSch({
      token: tkn,
      uid: usr._id,
      userAgent: userAgent,
      clientIp: req.ip,
    });
    await tokenS.save();
    return res.status(200).json({
      status: "success",
      message: "Login successful!",
      data: {
        tokenS,
        user_token: tkn,
        uid: usr._id,
        role: usr.role,
        status: parseStatus(usr.status),
        validity: parseInt(Date.now() + 24 * 60 * 60 * 1000),
      },
    });
  }
  console.log("INCORRECT PASSWORD");
  return res.status(200).json({
    status: "failed",
    message: "Incorrect Password",
  });
  // } catch (err) {
  //     console.log(`ERROR: ${err.message}`);
  //     return res.status(200).json({
  //         'status': 'failed',
  //         'message': 'Invalid Credentials'
  //     });
  // }
});

router.get("/user", async (req, res) => {
  try {
    const token = req.query.token;
    if ((token || "") != "") {
      console.log(token);
      const tknn = await tokenSch.findOne({ token: token });
      if (tknn == null) {
        return res.status(200).json({
          status: "failed",
          message: "Invalid Token",
        });
      }
      const user = await userSch.findById(tknn.uid);
      if (user == null) {
        return res.status(200).json({
          status: "failed",
          message: "User not found!",
        });
      }
      user.status = parseStatus(user.status);
      if ((user.team_leader_id || "") != "") {
        const tl = await userSch.findOne({ tl_id: user.team_leader_id });
        if (tl != null) {
          user.team_leader_name = tl.name;
        }
      }
      return res.status(200).json({
        status: "success",
        data: user,
      });
    }
    return res.status(200).json({
      status: "failed",
      message: "Invalid Token",
    });
  } catch (err) {
    console.log(`ERROR: ${err.message}`);
    return res.status(200).json({
      status: "failed",
      message: "Invalid Token",
    });
  }
});

router.get("/teamLeaderId", async (req, res) => {
  try {
    if (req.query.tlId != null) {
      const usr = await userSch.findOne({ tl_id: req.query.tlId });
      console.log(usr);
      if (usr != null) {
        return res.status(200).json({
          status: "success",
          valid: usr != null,
          name: usr.name,
          tl_id: usr.tl_id,
          phone: usr.phone,
          ...(req.query.showExtra && {
            _id: usr._id,
            email: usr.email,
            address: usr.address,
            state: usr.state,
            district: usr.district,
            emergency_contact: usr.emergency_contact,
            status: usr.status,
            role: usr.role,
            team_leader_id: usr.team_leader_id,
            created_at: usr.created_at,
            uid: usr.uid,
            lat: usr.lat,
            lon: usr.lon,
            image: usr.image,
            id_proof: usr.id_proof,
          }),
        });
      }
    }
    return res.status(200).json({
      status: "failed",
      message: "Invalid TL ID",
    });
  } catch (err) {
    console.log(`ERROR: ${err.message}`);
    return res.status(200).json({
      status: "failed",
      message: err.message,
    });
  }
});

router.get("/single/:userId", async (req, res) => {
  try {
    const token = req.query.token;
    if ((token || "") != "") {
      console.log(token);
      const tknn = await tokenSch.findOne({ token: token });
      if (tknn == null) {
        return res.status(200).json({
          status: "failed",
          message: "Invalid Token",
        });
      }
      if ((req.params.userId || "") != "") {
        if (req.params.userId.length > 8) {
          const user = await userSch.findById(req.params.userId);
          if (user != null) {
            user.status = parseStatus(user.status);
            return res.status(200).json({
              status: "success",
              data: user,
            });
          } else {
            const usr = await userSch.findOne({ uid: req.params.userId });
            if (usr != null) {
              usr.status = parseStatus(usr.status);
              return res.status(200).json({
                status: "success",
                data: usr,
              });
            }
          }
        } else {
          const usr = await userSch.findOne({ uid: req.params.userId });
          if (usr != null) {
            usr.status = parseStatus(usr.status);
            return res.status(200).json({
              status: "success",
              data: usr,
            });
          }
          return res.status(200).json({
            status: "failed",
            message: "User not found!",
          });
        }
      }
    }
    return res.status(200).json({
      status: "failed",
      message: "Invalid Token",
    });
  } catch (err) {
    console.log(`ERROR: ${err.message}`);
    return res.status(200).json({
      status: "failed",
      message: "Invalid Token",
    });
  }
});

router.get("/users", async (req, res) => {
  // // const usrs = await userSch.find();
  // // for (let x of usrs) {
  // //     await userSch.findByIdAndUpdate(x._id, {
  // //         delivered: [],
  // //         d_count: 0,
  // //         ud_count: 0,
  // //         score: 0
  // //     });
  // // }
  // // const cards = await cardSch.find();
  // // for (let x of cards) {
  // //     const ussr = await userSch.findById(x.created_by);
  // //     await cardSch.findByIdAndUpdate(x._id, {
  // //         // status: 'SUBMITTED'
  // //         state: ussr.current_state,
  // //         district: ussr.current_district,
  // //         tehsil: ussr.current_tehsil,
  // //         area: ussr.current_gram_panchayat
  // //     });
  // //     console.log(x._id);
  // // }
  // // return res.status(200).json({});
  // const usrs = await userSch.find();
  // for (let x of usrs) {
  //     console.log(x.uid);
  //     const submitted = await cardSch.count({
  //         created_by: x._id,
  //     });
  //     const p2 = await cardSch.count({
  //         created_by: x._id,
  //         status: 'SUBMITTED'
  //     });
  //     const p = await cardSch.count({
  //         created_by: x._id,
  //         status: 'PRINTED'
  //     });
  //     const delivered = await cardSch.count({
  //         created_by: x._id,
  //         status: 'DELIVERED'
  //     });
  //     const undelivered = await cardSch.count({
  //         created_by: x._id,
  //         status: 'UNDELIVERED'
  //     });
  //     const dis = await cardSch.count({
  //         created_by: x._id,
  //         status: 'DISCARDED'
  //     });
  //     await userSch.findByIdAndUpdate(x._id, {
  //         score: submitted,
  //         p2_count: p2,
  //         p_count: p,
  //         d_count: delivered,
  //         ud_count: undelivered,
  //         dis_count: dis
  //     });
  // }
  // return res.status(200).json({});
  try {
    const token = req.query.token;
    if ((token || "") != "") {
      console.log(token);
      const tknn = await tokenSch.findOne({ token: token });
      if (tknn == null) {
        return res.status(200).json({
          status: "failed",
          message: "Invalid Token",
        });
      }
      const user = await userSch.findById(tknn.uid);
      if (user == null || user.status != "Verified") {
        return res.status(200).json({
          status: "failed",
          message:
            user == null
              ? "Access Denied"
              : `${user.status} User: Access Denied`,
        });
      }
      var qry = {};
      if (req.query.q != null) {
        if (phoneRegex.test(req.query.q)) {
          qry.phone = {
            $regex: req.query.q,
            $options: "i",
          };
        } else if (userUIDRegex.test(req.query.q)) {
          qry.uid = {
            $regex: req.query.q,
            $options: "i",
          };
        } else {
          qry.name = {
            $regex: req.query.q,
            $options: "i",
          };
        }
      }
      if (req.query.role == "TL") {
        qry.role = "TL";
      }
      if (req.query.state != null) {
        qry.state = req.query.state;
      }
      if (req.query.district != null) {
        qry.district = req.query.district;
      }
      if (req.query.status != null) {
        if (req.query.mode != "ADMIN") {
          qry.status = req.query.status;
        } else {
          if (req.query.status == "Active") {
            qry.$and = [
              {
                last_fetch: {
                  $gte: parseInt(Date.now()) - 5 * 24 * 60 * 60 * 1000,
                },
              },
              { status: "Verified" },
            ];
          } else if (req.query.status == "Inactive") {
            qry.$and = [
              {
                last_fetch: {
                  $lt: parseInt(Date.now()) - 5 * 24 * 60 * 60 * 1000,
                },
              },
              { status: "Verified" },
            ];
          } else {
            qry.status = req.query.status;
          }
        }
      }
      console.log(qry);
      if (req.query.janPanchayat != null) {
        qry.current_janpad = req.query.janPanchayat;
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
      if ((req.query.onlyInfo || "").toString() == "true") {
        const list = await userSch.find(qry).select({
          _id: 1,
          name: 1,
          uid: 1,
          tl_id: 1,
        });
        return res.status(200).json({
          status: "success",
          data: list,
        });
      } else {
        const users = await userSch
          .find(qry)
          .sort(
            req.query.sortBy == "created_at"
              ? {
                  created_at: -1,
                }
              : { score: -1, status: 1, name: 1 }
          )
          .skip(
            parseInt(req.query.page || 0) * parseInt(req.query.limit || "40")
          )
          .limit(parseInt(req.query.limit || "40"));
        var list = Array();
        for (let x of users) {
          if (req.query.mode != "ADMIN") {
            x.status = parseStatus(x.status);
          } else {
            const ct = x.score;
            const delivered = x.d_count;
            x.ratio = delivered == 0 ? 0 : (delivered / ct) * 100;
          }
          if (req.query.mode != "ADMIN" || user.role != "ADMIN") {
            x.password = "";
          }
          list.push(x);
        }
        const visible = await userSch.countDocuments(qry);
        const total = await userSch.countDocuments();
        return res.status(200).json({
          status: "success",
          page_number: req.query.page || "0",
          total_results: visible,
          total: total,
          data: list,
        });
      }
    }
    return res.status(200).json({
      status: "failed",
      message: "Invalid Token",
    });
  } catch (err) {
    console.log(`ERROR: ${err.message}`);
    return res.status(200).json({
      status: "failed",
      message: "Invalid Token",
    });
  }
});

router.patch("/user/:id", async (req, res) => {
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
    const requestUser = await userSch.findById(token.uid);
    const oldData = await userSch.findById(req.params.id);
    var fields = {};
    if (req.body.image != null) {
      fields.image = req.body.image;
    }
    if (req.body.name != null) {
      fields.name = req.body.name;
    }
    if (req.body.phone != null) {
      fields.phone = req.body.phone;
    }
    if (req.body.id_proof != null) {
      fields.id_proof = req.body.id_proof;
    }
    if (req.body.state != null) {
      fields.state = req.body.state;
    }
    if (req.body.district != null) {
      fields.district = req.body.district;
    }
    if (req.body.blood_group != null) {
      fields.blood_group = req.body.blood_group;
    }
    if (req.body.dob != null) {
      fields.dob = req.body.dob;
    }
    if (req.body.password != null) {
      fields.password = req.body.password;
    }
    if (req.body.device_id != null) {
      fields.device_id = req.body.device_id;
    }
    if (req.body.email != null) {
      fields.email = req.body.email;
    }
    if (req.body.address != null) {
      fields.address = req.body.address;
    }
    if (req.body.emergency_contact != null) {
      fields.emergency_contact = req.body.emergency_contact;
    }
    if (req.body.team_leader_id != null) {
      fields.team_leader_id = req.body.team_leader_id;
    }
    if (requestUser.role == "ADMIN") {
      if (req.body.role != null) {
        fields.role = req.body.role;
      }
    }
    if (req.body.status != null) {
      fields.status = req.body.status;
      fields.suspension_reason = req.body.suspension_reason;
    }
    if (req.body.current_state != null) {
      fields.current_state = req.body.current_state;
    }
    if (req.body.current_district != null) {
      fields.current_district = req.body.current_district;
    }
    if (req.body.current_location_type != null) {
      fields.current_location_type = req.body.current_location_type;
    }
    if (req.body.current_janpad != null) {
      fields.current_janpad = req.body.current_janpad;
    }
    if (req.body.current_gram_panchayat != null) {
      fields.current_gram_panchayat = req.body.current_gram_panchayat;
    }
    if (req.body.current_tehsil != null) {
      fields.current_tehsil = req.body.current_tehsil;
    }
    if (req.body.current_pincode != null) {
      fields.current_pincode = req.body.current_pincode;
    }
    if (req.body.current_maplink != null) {
      fields.current_maplink = req.body.current_maplink;
    }
    if (req.body.last_fetch != null) {
      fields.last_fetch = req.body.last_fetch;
    }
    if (req.body.reject_reason != null) {
      fields.reject_reason = req.body.reject_reason;
    }
    if (oldData.tl_id && req.body.role == "TL") {
      fields.team_leader_id = "";
    }
    if (req.body.role == "TL" && (oldData.tl_id || "") == "") {
      let uuid;
      while (true) {
        var x = (Math.floor(Math.random() * (99999 - 10001 + 1)) + 10001)
          .toString()
          .padStart(5, "0");
        const uid = `TL${x}`;
        const qry = await userSch.exists({ tl_id: uid });
        if (!qry) {
          uuid = uid;
          break;
        }
      }
      fields.team_leader_id = "";
      fields.tl_id = uuid;
    }
    if (oldData.name != req.body.name) {
      await cardSch.updateMany(
        {
          created_by: req.params.id,
        },
        {
          created_by_name: req.body.name,
        }
      );
      await hospitalSch.updateMany(
        {
          created_by: req.params.id,
        },
        {
          created_by_name: req.body.name,
        }
      );
    }
    const us = await userSch.findByIdAndUpdate(req.params.id, fields);
    const user = await userSch.findById(req.params.id);
    return res.status(200).json({
      status: "success",
      message: "User updated successfully",
      data: user,
    });
  } catch (err) {
    return res.status(200).json({
      status: "failed",
      message: err.message,
    });
  }
});

router.patch("/user/suspend/:id", async (req, res) => {
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

    if (!["Suspended", "Verified"].includes(req.body.status)) {
      return res.status(200).json({
        status: "failed",
        message: "Invalid status",
      });
    }
    const fields = {};
    const status = req.body.status;
    fields.status = status;
    if (status === "Suspended") {
      fields.suspension_reason = req.body.suspension_reason;
    }
    const us = await userSch.findByIdAndUpdate(req.params.id, fields, {
      new: true,
    });
    return res.status(200).json({
      status: "success",
      message: "User updated successfully",
      data: us,
    });
  } catch (error) {
    return res.status(200).json({
      status: "failed",
      message: err.message,
    });
  }
});

router.post("/register", async (req, res) => {
  console.log(req.body);
  try {
    const usr = await userSch.find({ phone: req.body.phone });
    if (usr.length > 0) {
      console.log("USER EXISTS");
      return res.status(200).json({
        status: "failed",
        message: "User already exists with this phone number!",
      });
    }
    if (req.body.password != "") {
      console.log("SUCCESS");
      //create user token and store in user document
      //.....
      let uuid;
      while (true) {
        var x = (Math.floor(Math.random() * (99999 - 10001 + 1)) + 10001)
          .toString()
          .padStart(5, "0");
        const uid = `FE${x}`;
        const qry = await userSch.exists({ uid: uid });
        if (!qry) {
          uuid = uid;
          break;
        }
      }
      const uxid = uuid;

      // const uxid = `FE${length.toString().padStart(5, '0')}`;
      const user = new userSch({
        uid: uxid,
        name: req.body.name,
        phone: req.body.phone,
        password: req.body.password,
        email: req.body.email,
        image: req.body.image,
        address: req.body.address,
        state: req.body.state,
        district: req.body.district,
        id_proof: req.body.id_proof,
        last_fetch: parseInt(Date.now()),
        emergency_contact: req.body.emergency_contact,
        team_leader_id: req.body.team_leader_id,
        device_id: req.body.device_id,
        created_at: parseInt(Date.now()),
        status: "Unverified",
        role: req.body.role == "ADMIN" ? "FE" : req.body.role, //req.body.role || "FE",
        lat: parseFloat(req.body.lat) || 0.0,
        lon: parseFloat(req.body.lon) || 0.0,
      });
      const resp = await user.save();
      const usr = await userSch.findOne({ phone: req.body.phone });
      //create user token and store in user document
      const tokgen = new TokenGenerator(); // Default is a 128-bit token encoded in base58
      const tkn = tokgen.generate();
      // const encoder = new UuidEncoder('base64');
      // const tc = encoder.encode(tkn);
      //.....
      const tks = await tokenSch.find({ uid: usr._id });
      for (let t of tks) {
        await t.remove();
      }
      const tokenS = tokenSch({
        token: tkn,
        uid: usr._id,
      });
      resp.status = parseStatus(usr.status);
      await tokenS.save();
      return res.status(200).json({
        status: "success",
        message: "User registered successfully!",
        data: {
          user_token: tkn,
          uid: user._id,
          status: parseStatus(usr.status),
          validity: parseInt(Date.now() + 24 * 60 * 60 * 1000),
          user: resp,
        },
      });
    }
    console.log("INCORRECT DATA");
    return res.status(200).json({
      status: "failed",
      message: "Invalid Data",
    });
  } catch (err) {
    console.log(`ERROR: ${err.message}`);
    return res.status(200).json({
      status: "failed",
      message: "Invalid Data",
    });
  }
});

router.post("/sendCode", async (req, res) => {
  try {
    if ((req.body.email || "") == "") {
      return res.status(200).json({
        status: "failed",
        message: "Invalid email",
      });
    }
    const user = await userSch.findOne({
      email: req.body.email,
      role: "ADMIN",
    });
    if (user != null) {
      const otp = random(6);
      const codeResp = await otpSch({
        code: otp,
        time: Date.now(),
        user_id: user._id,
      }).save();
      if (codeResp != null) {
        try {
          if (
            (await sendEmail(
              req.body.email,
              `Your Security code is ${otp}`,
              "Aarogyam Admin password reset"
            )) != null
          ) {
            return res.status(200).json({
              status: "success",
              message: "code send successfully",
              data: codeResp._id,
            });
          }
        } catch (err) {
          return res.status(200).json({
            status: "failed",
            message: err,
          });
        }
      }
    }
    return res.status(200).json({
      status: "failed",
      message: "Invalid email",
    });
  } catch (err) {
    console.log(`ERROR: ${err.message}`);
    return res.status(200).json({
      status: "failed",
      message: err,
    });
  }
});

router.post("/verifyCode", async (req, res) => {
  try {
    if ((req.body.code || "") == "") {
      return res.status(200).json({
        status: "failed",
        message: "Invalid email",
      });
    }
    if ((req.body.verificationId || "") == "") {
      return res.status(200).json({
        status: "failed",
        message: "Invalid Verification Id",
      });
    }
    const otpData = await otpSch.findById(req.body.verificationId);
    if (otpData != null) {
      if (otpData.code == req.body.code) {
        const token = random(10);
        await otpSch.findByIdAndUpdate(req.body.verificationId, {
          token: token.toString(),
        });
        return res.status(200).json({
          status: "success",
          message: "Verification Successful",
          data: token,
        });
      } else {
        return res.status(200).json({
          status: "failed",
          message: "OTP did not match",
        });
      }
    }
    return res.status(200).json({
      status: "failed",
      message: "Invalid data",
    });
  } catch (err) {
    console.log(`ERROR: ${err.message}`);
    return res.status(200).json({
      status: "failed",
      message: err,
    });
  }
});

router.post("/submitPassword", async (req, res) => {
  try {
    if ((req.body.password || "") == "") {
      return res.status(200).json({
        status: "failed",
        message: "Invalid password",
      });
    }
    if ((req.body.token || "") == "") {
      return res.status(200).json({
        status: "failed",
        message: "Invalid Token",
      });
    }
    const otpData = await otpSch.findOne({ token: req.body.token });
    if (otpData != null) {
      await userSch.findByIdAndUpdate(otpData.user_id, {
        password: req.body.password,
      });
      return res.status(200).json({
        status: "success",
        message: "Password changed successful!",
      });
    }
    return res.status(200).json({
      status: "failed",
      message: "Failed to update password",
    });
  } catch (err) {
    console.log(`ERROR: ${err.message}`);
    return res.status(200).json({
      status: "failed",
      message: err,
    });
  }
});

router.get("/users-by-ids", async (req, res) => {
  try {
    if (!req.query?.token) {
      return res.status(401).json({
        status: "Failed",
        message: "Token Missing",
      });
    }
    const token = await tokenSch.findOne({ token: req.query.token });
    if (token == null) {
      return res.status(200).json({
        status: "failed",
        message: "Invalid Token",
      });
    }
    return res.status(200).json({
      status: "success",
      message: "success",
      data: await userSch.find(
        { uid: { $in: req.query.ids.split(",") } },
        { name: 1, tl_id: 1, uid: 1 }
      ),
    });
  } catch (err) {
    return res.status(200).json({
      status: "failed",
      message: err,
    });
  }
});

function random(len) {
  let result = Math.floor(Math.random() * Math.pow(10, len));

  return result.toString().length < len ? random(len) : result;
}

async function sendEmail(toEmail, body, subject) {
  try {
    const accessToken = await oAuth2Client.getAccessToken();
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: MY_EMAIL,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken,
      },
      tls: {
        rejectUnauthorized: true,
      },
    });

    let mailOptions = {
      from: "" + appName + " <" + senderEmail + ">",
      to: toEmail,
      subject: subject,
      text: body,
      replyTo: senderEmail,
    };

    return await transporter.sendMail(mailOptions);
  } catch (err) {
    console.log(err);
  }
}

function parseStatus(status) {
  return status;
}

module.exports = router;
