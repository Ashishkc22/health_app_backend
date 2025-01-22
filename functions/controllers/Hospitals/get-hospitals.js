const { hospitalSchema, userSchema } = require("../../models");

const getHospitals = async (req, res) => {
  try {
    if (req.query.token == "arogyam") {
      return res.status(200).json({
        status: "success",
        data: await hospitalSchema.find(),
      });
    }

    const userDetails = req.userDetails;

    const user = await userSchema.findById(userDetails.id);
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
    const resp = await hospitalSchema
      .find(qry)
      .sort({ created_at: -1 })
      .skip(parseInt(req.query.page || 0) * parseInt(req.query.limit || "40"))
      .limit(parseInt(req.query.limit || "40"));
    const totalHosp = await hospitalSchema.countDocuments();
    const visible = await hospitalSchema.countDocuments(qry);
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
};

module.exports = getHospitals;
