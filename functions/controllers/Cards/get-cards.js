const { userSchema, cardSchema } = require("../../models");

function monthName(month) {
  switch (month) {
    case 0:
      return "JAN";
    case 1:
      return "FEB";
    case 2:
      return "MAR";
    case 3:
      return "APR";
    case 4:
      return "MAY";
    case 5:
      return "JUN";
    case 6:
      return "JUL";
    case 7:
      return "AUG";
    case 8:
      return "SEP";
    case 9:
      return "OCT";
    case 10:
      return "NOV";
    case 11:
      return "DEC";
  }
  return month.toString();
}

function weekName(day) {
  switch (day) {
    case 0:
      return "SUN";
    case 1:
      return "MON";
    case 2:
      return "TUE";
    case 3:
      return "WED";
    case 4:
      return "THU";
    case 5:
      return "FRI";
    case 6:
      return "SAT";
  }
  return day.toString();
}

const getCards = async (req, res, next) => {
  try {
    const tokenUser = await userSchema.findById(req.userDetails.id);
    if (tokenUser == null || tokenUser.status != "Verified") {
      return res.status(200).json({
        status: "failed",
        message:
          tokenUser == null
            ? "Access Denied"
            : `${tokenUser.status} User: Access Denied`,
      });
    }
    var qry = {};
    var createdQry = {};
    if (req.query.from != null && req.query.to != null) {
      qry.created_at = {
        $gte: parseInt(req.query.from),
        $lte: parseInt(req.query.to),
      };
    } else {
      if (req.query.from != null) {
        createdQry.$gte = parseInt(req.query.from);
        qry.created_at = createdQry;
      }
      if (req.query.to != null) {
        createdQry.$lte = parseInt(req.query.to);
        qry.created_at = createdQry;
      }
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
        let ltDur =
          parseInt(req.query.till_duration) != null &&
          parseInt(req.query.till_duration) != NaN
            ? parseInt(req.query.till_duration)
            : parseInt(req.query.duration) + 24 * 60 * 60 * 1000;

        ltDur = moment(ltDur).subtract(1, "hour").valueOf();
        qry.created_at = {
          $gte: parseInt(req.query.duration),
          $lte: ltDur,
        };
        console.log(qry);
      }
    }

    if (req.query.q != null) {
      qry.$or = [
        { unique_number: req.query.q },
        {
          name: {
            $regex: req.query.q,
            $options: "i",
          },
        },
        { phone: req.query.q },
      ];
    }
    if (req.query.status != null) {
      if (req.query.mode == "ADMIN") {
        if (req.query.status === "SUBMITTED") {
          qry.status = {
            $in: ["REPRINT", "SUBMITTED"],
          };
        } else {
          qry.status = req.query.status;
        }
      } else {
        if (req.query.status.toString().toLowerCase().startsWith("other")) {
          qry.status = {
            $in: ["UNDELIVERED", "DISCARDED"],
          };
        } else if (
          req.query.status.toString().toLowerCase().startsWith("submitted")
        ) {
          qry.status = {
            $in: ["PRINTED", "SUBMITTED"],
          };
        } else {
          qry.status = req.query.status;
        }
      }
    }
    if (req.query.tehsil != null) {
      qry.tehsil = req.query.tehsil;
    }
    if (req.query.state != null) {
      qry.state = req.query.state;
    }
    if (req.query.district != null) {
      qry.district = req.query.district;
    }
    if (req.query.gram_p != null) {
      qry.area = req.query.gram_p;
    }
    if (req.query.mode == "ADMIN" && req.query.status == "SUBMITTED") {
      if ((req.query.created_by || "") != "") {
        qry.created_by_uid = req.query.created_by;
      }
      const data = await cardSchema
        .find(qry)
        .sort({
          // tehsil: 1,
          // created_by: 1,
          created_at: req.query.sortBy ? 1 : -1,
        })
        .skip(parseInt(req.query.page || 0) * parseInt(req.query.limit || "40"))
        .limit(parseInt(req.query.limit || "40"));
      const totalCards = await cardSchema.countDocuments();
      const totalQryCards = await cardSchema.countDocuments(qry);
      var x = {};
      for (let v of Object.keys(qry)) {
        if (v != "status") {
          x[v] = qry[v];
        }
      }
      x.status = { $in: ["REPRINT", "SUBMITTED"] };
      console.log("total x", x);
      const totalPrintCardsShowing = await cardSchema.countDocuments(x);
      const totalPrintCards = await cardSchema.countDocuments({
        status: { $in: ["REPRINT", "SUBMITTED"] },
        $or: [
          {
            created_at: {
              $lt: moment().startOf("day").hour(10).valueOf(),
            },
          },
        ],
      });
      return res.status(200).json({
        status: "success",
        page_number: req.query.page || "0",
        total: totalCards,
        total_showing: totalQryCards,
        total_print_card: totalPrintCards,
        total_print_card_showing: totalPrintCardsShowing,
        data: data,
      });
    }
    if (Object.keys(qry).length == 0 && req.query.responseType == "COUNT") {
      const submitted = await cardSchema.countDocuments({
        $or: [{ status: "SUBMITTED" }, { status: "PRINTED" }],
        created_by: tokenUser._id,
      });
      const delivered = await cardSchema.countDocuments({
        status: "DELIVERED",
        created_by: tokenUser._id,
      });
      const others = await cardSchema.countDocuments({
        status: {
          $in: ["UNDELIVERED", "DISCARDED"],
        },
        created_by: tokenUser._id,
      });
      const total = await cardSchema.countDocuments({
        created_by: tokenUser._id,
      });
      return res.status(200).json({
        status: "success",
        page_number: req.query.page || "0",
        total: total,
        submitted: submitted,
        delivered: delivered,
        other: others,
      });
    } else {
      if (tokenUser.role == "ADMIN" && req.query.created_by != null) {
        qry.created_by_uid = req.query.created_by;
      }
      if (req.query.mode != "ADMIN") {
        qry.created_by = tokenUser._id;
      }
      const statusCount =
        (
          await cardSchema.aggregate([
            // { $match: qry },
            {
              $group: {
                _id: "$status",
                count: { $sum: 1 },
              },
            },
            {
              $group: {
                _id: null, // No grouping by a specific field, just collecting all data
                result: {
                  $push: {
                    k: "$_id", // Use the value from the _id field as the key
                    v: "$count", // Use the count field as the value
                  },
                },
              },
            },
            {
              $replaceRoot: {
                newRoot: { $arrayToObject: "$result" }, // Converts the array into an object
              },
            },
          ])
        )?.[0] || [];
      const documentCount = await cardSchema.countDocuments(qry);
      let skip = 0;
      let sort = {};
      let pageNumber = req.query.page || "0";
      if (tokenUser.role === "ADMIN") {
        skip =
          documentCount > parseInt(req.query.limit || "40")
            ? parseInt(req.query.page || 0) * parseInt(req.query.limit || "40")
            : 0;
        sort = {
          ...(req.query.sortBy && { status_updated_at: -1 }),
          created_at: -1,
        };
      } else {
        skip =
          parseInt(req.query.page || 0) * parseInt(req.query.limit || "40");
        sort = { created_at: -1, tehsil: 1, created_by: 1 };
      }
      const resp = await cardSchema
        .find(qry)
        .sort({
          ...sort,
        })
        .skip(skip)
        .limit(parseInt(req.query.limit || "40"));
      var tss = Array();
      for (let x of resp) {
        const date = new Date(x.created_at);
        const str = `${weekName(date.getDay())} ${date.getDate()} ${monthName(
          date.getMonth()
        )} ${date.getFullYear()}`;
        if (!tss.includes(str)) {
          tss.push(str);
        }
      }
      var newList = resp.map((x) => {
        const date = new Date(x.expiry_date || 0);
        x.expiry = `${monthName(date.getMonth())} ${date.getFullYear()}`;
        if (req.query.mode != "ADMIN") {
          x.status = x.status;
        }
        x.address = `${x.area}, ${x.tehsil}, ${x.district}, ${x.state}`;
        return x;
      });
      if (req.query.responseType == "LIST") {
        const totalCards = await cardSchema.countDocuments({
          // $or: [
          //   { created_at: { $lt: moment().startOf("day").hour(10).valueOf() } },
          // ],
        });
        const totalQryCards = await cardSchema.countDocuments(qry);
        var x = {};
        for (let v of Object.keys(qry)) {
          if (v != "status") {
            x[v] = qry[v];
          }
        }
        x.status = { $in: ["REPRINT", "SUBMITTED"] };

        const totalPrintCardsShowing = await cardSchema.countDocuments(x);
        const totalPrintCards = await cardSchema.countDocuments({
          status: { $in: ["REPRINT", "SUBMITTED"] },
          // $or: [
          //   {
          //     created_at: {
          //       $lt: moment().startOf("day").hour(10).valueOf(),
          //     },
          //   },
          // ],
        });
        if (tokenUser === "ADMIN") {
          pageNumber =
            totalQryCards > parseInt(req.query.limit || "40")
              ? req.query.page || "0"
              : "0";
        }
        return res.status(200).json({
          status: "success",
          page_number: pageNumber,
          total: totalCards,
          total_showing: totalQryCards,
          total_print_card: totalPrintCards,
          total_print_card_showing: totalPrintCardsShowing,
          statusCount,
          // 'submitted': totalPrintCardsShowing,
          // 'delivered': newList.filter((a) => a.status.toString().toUpperCase() == "DELIVERED").length,
          // 'other': newList.filter((a) => (!(["DELIVERED", "SUBMITTED", "UNDELIVERED"].includes(a.status.toString().toUpperCase())))).length,
          data: newList,
        });
      }
      var finalList = Array();
      for (let t of tss) {
        const entires = newList
          .filter((a) => {
            const date = new Date(a.created_at);
            const str = `${weekName(
              date.getDay()
            )} ${date.getDate()} ${monthName(
              date.getMonth()
            )} ${date.getFullYear()}`;
            return str == t;
          })
          .map((e) => {
            e.status = parseStatus(e.status);
            return e;
          });
        finalList.push({
          date: t,
          count: entires.length,
          data: entires,
        });
        // finalList = finalList.concat(entires);
      }
      return res.status(200).json({
        status: "success",
        page_number: req.query.page || "0",
        // 'total': totalCards,
        // 'incomplete': newList.filter((a) => a.status.toString().toUpperCase() == "INCOMPLETE").length,
        // 'submitted': newList.filter((a) => a.status.toString().toUpperCase() == "SUBMITTED").length,
        // 'delivered': newList.filter((a) => a.status.toString().toUpperCase() == "DELIVERED").length,
        // 'other': newList.filter((a) => (!(["DELIVERED", "SUBMITTED", "INCOMPLETE"].includes(a.status.toString().toUpperCase())))).length,
        data: finalList,
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = getCards;
