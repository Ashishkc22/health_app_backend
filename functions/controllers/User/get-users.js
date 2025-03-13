const { userSchema } = require("../../models");
const { getUser } = require("../../processors");
const { sortBy } = require("lodash");
const {
  RegexEnum: { phoneRegex, userUIDRegex },
} = require("../../Enums");

const getUsers = async (req, res, next) => {
  try {
    const user = await getUser({ id: req.userDetails.id });

    var qry = {
      role: { $ne: "USER" },
    };
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
    if (req.query.janPanchayat != null) {
      qry.current_janpad = req.query.janPanchayat;
    }
    if (req.query.duration != null) {
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
      }
    }
    if ((req.query.onlyInfo || "").toString() == "true") {
      const list = await userSchema.find(qry).select({
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
      const users = await userSchema
        .find(qry)
        .sort(
          req.query.sortBy == "created_at"
            ? {
                created_at: -1,
              }
            : { score: -1, status: 1, name: 1 }
        )
        .skip(parseInt(req.query.page || 0) * parseInt(req.query.limit || "40"))
        .limit(parseInt(req.query.limit || "40"));
      var list = Array();
      for (let x of users) {
        if (req.query.mode != "ADMIN") {
          x.status = x.status;
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
      if (req.query.sortBy === "ratio") {
        list = sortBy(list, "ratio").reverse();
      }
      const visible = await userSchema.countDocuments(qry);
      const total = await userSchema.countDocuments();
      return res.status(200).json({
        status: "success",
        page_number: req.query.page || "0",
        total_results: visible,
        total: total,
        data: list,
      });
    }
  } catch (err) {
    next(err);
  }
};

module.exports = getUsers;
