const express = require("express");
const cardSch = require("../models/card");
const router = express.Router();
const dashboardSchema = require("../models/dashboard_data");
const hospital = require("../models/hospital");
const userSch = require("../models/user");
const tokenSch = require("../models/token");
const moment = require("moment");
const { isEmpty } = require("lodash");

const getDocumentCount = async ({ query = {}, dbSchema }) => {
  if (dbSchema) {
    return {
      today: await dbSchema.countDocuments({
        created_at: { $gte: moment().startOf("day").valueOf() },
        ...query,
      }),
      yesterday: await dbSchema.countDocuments({
        created_at: {
          $gte: moment().subtract(1, "day").startOf("day").valueOf(),
          $lte: moment().subtract(1, "day").endOf("day").valueOf(),
        },
        ...query,
      }),
    };
  }
  return {
    today: 0,
    yesterday: 0,
  };
};

router.get("/", async (req, res) => {
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
    const user = await userSch.findById(token.uid);
    if (user == null || user.status != "Verified") {
      return res.status(200).json({
        status: "failed",
        message:
          user == null ? "Access Denied" : `${user.status} User: Access Denied`,
      });
    }
    var qry = {};
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
        qry = {};
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
    if (user.role == "ADMIN" && req.query.type == "ADMIN") {
      const totalUser = await userSch.countDocuments(qry);
      var q = { status: "Unverified" };

      if (qry.created_at != null) {
        q.created_at = qry.created_at;
      }
      const unVerified = await userSch.countDocuments({
        $or: [{ status: "Unverified" }, { status: "Verification Pending" }],
        ...(qry.created_at && { created_at: qry.created_at }),
      });
      q.status = "Verified";
      const verified = await userSch.countDocuments(q);
      q = {
        $and: [
          {
            last_fetch: {
              $gte: parseInt(Date.now()) - 5 * 24 * 60 * 60 * 1000,
            },
          },
          { status: "Verified" },
        ],
      };
      if (qry.created_at != null) {
        q.created_at = qry.created_at;
      }
      const active = await userSch.countDocuments(q);
      const inactive = verified - active;
      q = { status: "Suspended" };
      if (qry.created_at != null) {
        q.created_at = qry.created_at;
      }
      const suspended = await userSch.countDocuments(q);
      q.status = "Rejected";
      const rejected = await userSch.countDocuments(q);
      // Total card count
      const totalCards = await cardSch.countDocuments(qry);
      q.status = { $in: ["SUBMITTED", "REPRINT"] };
      let todayTotalCards = 0;
      let yesterdayTotalCards = 0;
      if (user.role == "ADMIN" && req.query.type == "ADMIN") {
        const result = await getDocumentCount({ dbSchema: cardSch });
        todayTotalCards = result.today;
        yesterdayTotalCards = result.yesterday;
      }
      const availableToPrint = await cardSch.countDocuments(q);
      let availableToPrintTodayCount = 0;
      let availableToPrintYesterdayCount = 0;

      if (user.role == "ADMIN" && req.query.type == "ADMIN") {
        const result = await getDocumentCount({
          dbSchema: cardSch,
          query: {
            status: { $in: ["SUBMITTED", "REPRINT"] },
          },
        });
        availableToPrintTodayCount = result.today;
        availableToPrintYesterdayCount = result.yesterday;
      }
      q.status = "PRINTED";
      const printed = await cardSch.countDocuments(q);
      let printedTodayCount = 0;
      let printedYesterdayCount = 0;

      if (user.role == "ADMIN" && req.query.type == "ADMIN") {
        const result = await getDocumentCount({
          dbSchema: cardSch,
          query: {
            status: "PRINTED",
          },
        });
        printedTodayCount = result.today;
        printedYesterdayCount = result.yesterday;
      }
      q.status = "UNDELIVERED";
      const undeliveredCards = await cardSch.countDocuments(q);
      let undeliveredCardsTodayCount = 0;
      let undeliveredCardsYesterdayCount = 0;

      if (user.role == "ADMIN" && req.query.type == "ADMIN") {
        const result = await getDocumentCount({
          dbSchema: cardSch,
          query: {
            status: "UNDELIVERED",
          },
        });
        undeliveredCardsTodayCount = result.today;
        undeliveredCardsYesterdayCount = result.yesterday;
      }
      q.status = "DELIVERED";
      const deliveredCards = await cardSch.countDocuments(q);

      let deliveredCardsTodayCount = 0;
      let deliveredCardsYesterdayCount = 0;

      if (user.role == "ADMIN" && req.query.type == "ADMIN") {
        const result = await getDocumentCount({
          dbSchema: cardSch,
          query: {
            status: "DELIVERED",
          },
        });
        deliveredCardsTodayCount = result.today;
        deliveredCardsYesterdayCount = result.yesterday;
      }

      q.status = "DISCARDED";
      const discarded = await cardSch.countDocuments(q);

      let discardedCardsTodayCount = 0;
      let discardedCardsYesterdayCount = 0;

      if (user.role == "ADMIN" && req.query.type == "ADMIN") {
        const result = await getDocumentCount({
          dbSchema: cardSch,
          query: {
            status: "DISCARDED",
          },
        });
        discardedCardsTodayCount = result.today;
        discardedCardsYesterdayCount = result.yesterday;
      }

      const totalH = await hospital.countDocuments(qry);

      let totalHospitalTodayCount = 0;
      let totalHospitalYesterdayCount = 0;

      if (user.role == "ADMIN" && req.query.type == "ADMIN") {
        const result = await getDocumentCount({
          dbSchema: hospital,
        });
        totalHospitalTodayCount = result.today;
        totalHospitalYesterdayCount = result.yesterday;
      }

      q = { category: "Hospital" };
      if (qry.created_at != null) {
        q.created_at = qry.created_at;
      }
      const totalHosp = await hospital.countDocuments(q);

      let hospitalTodayCount = 0;
      let hospitalYesterdayCount = 0;

      if (user.role == "ADMIN" && req.query.type == "ADMIN") {
        const result = await getDocumentCount({
          dbSchema: hospital,
          query: { category: "Hospital" },
        });
        hospitalTodayCount = result.today;
        hospitalYesterdayCount = result.yesterday;
      }

      q.category = "Labs & Diagnostic Centers";
      const totalDC = await hospital.countDocuments(q);

      let totalDCTodayCount = 0;
      let totalDCYesterdayCount = 0;

      if (user.role == "ADMIN" && req.query.type == "ADMIN") {
        const result = await getDocumentCount({
          dbSchema: hospital,
          query: { category: "Labs & Diagnostic Centers" },
        });
        totalDCTodayCount = result.today;
        totalDCYesterdayCount = result.yesterday;
      }

      q.category = "Medical";
      const totalMedical = await hospital.countDocuments(q);

      let totalMedicalTodayCount = 0;
      let totalMedicalYesterdayCount = 0;

      if (user.role == "ADMIN" && req.query.type == "ADMIN") {
        const result = await getDocumentCount({
          dbSchema: hospital,
          query: { category: "Medical" },
        });
        totalMedicalTodayCount = result.today;
        totalMedicalYesterdayCount = result.yesterday;
      }

      return res.status(200).json({
        status: "success",
        data: {
          total_users: totalUser,
          un_verified_users: unVerified,
          verified_users: verified,
          active_users: active,
          inactive_users: inactive,
          suspended_users: suspended,
          rejected_users: rejected,
          total_cards: totalCards,
          todayTotalCards,
          yesterdayTotalCards,
          available_to_print: availableToPrint,
          availableToPrintTodayCount,
          availableToPrintYesterdayCount,
          printed: printed,
          printedTodayCount,
          printedYesterdayCount,
          undelivered_cards: undeliveredCards,
          undeliveredCardsTodayCount,
          undeliveredCardsYesterdayCount,
          delivered_cards: deliveredCards,
          deliveredCardsTodayCount,
          deliveredCardsYesterdayCount,
          discard_cards: discarded,
          discardedCardsTodayCount,
          discardedCardsYesterdayCount,

          total_hospital: totalH,
          totalHospitalTodayCount,
          totalHospitalYesterdayCount,
          hospitals: totalHosp,
          hospitalTodayCount,
          hospitalYesterdayCount,
          diagnostic_centers: totalDC,
          totalDCTodayCount,
          totalDCYesterdayCount,
          medicals: totalMedical,
          totalMedicalTodayCount,
          totalMedicalYesterdayCount,
        },
      });
    }
    var time = parseInt(Date.now() - 24 * 60 * 60 * 1000);
    if (req.query.period == "TODAY") {
      const nowDate = new Date(Date.now());
      time = new Date(
        nowDate.getFullYear(),
        nowDate.getMonth(),
        nowDate.getDate(),
        0,
        0
      ).getTime();
    }
    if (req.query.period == "WEEK") {
      const nowDate = new Date(Date.now());
      const weekDay = nowDate.getDay();
      time = new Date(
        nowDate.getFullYear(),
        nowDate.getMonth(),
        nowDate.getDate() - weekDay,
        0,
        0
      ).getTime();
    }
    if (req.query.period == "MONTH") {
      const nowDate = new Date(Date.now());
      const weekDay = nowDate.getDay();
      time = new Date(
        nowDate.getFullYear(),
        nowDate.getMonth(),
        1,
        0,
        0
      ).getTime();
    }
    const cards = await cardSch
      .find({
        created_at: {
          $gt: time,
        },
      })
      .select({
        created_by: 1,
        created_at: 1,
        status: 1,
      });
    console.log(cards);
    var sts = Array();
    for (let a of cards) {
      if (
        sts.filter((x) => {
          return x.uid == a.created_by;
        }).length == 0
      ) {
        const thisCards = cards.filter((x) => {
          return a.created_by == x.created_by;
        });
        const score = thisCards.length;
        const delivered = thisCards.filter((x) => {
          return x.status.toUpperCase() == "DELIVERED";
        });
        console.log(
          `ID:${a.created_by} - SCORE: ${score} , DELIVERED: ${delivered.length}`
        );
        const ratio = delivered.length == 0 ? 0 : delivered.length / score;
        let user;
        try {
          user = await userSch.findById(a.created_by || "");
        } catch (err) {
          user = null;
        }
        if (user != null) {
          sts.push({
            name: user.name,
            location: user.district,
            score: score,
            ratio: ratio * 100,
            uid: user._id,
          });
        }
      }
    }
    sts.sort((a, b) =>
      b.score - a.score == 0 ? (b.ratio > a.ratio ? 1 : 0) : b.score - a.score
    );
    const maxScore = Math.max(
      ...sts.map((e) => {
        return e.score;
      })
    );
    console.log(maxScore);
    var newSts = Array();
    for (let x of sts) {
      x.rank = sts.indexOf(x) + 1;
      x.claim_enabled = x.score == maxScore;
      newSts.push(x);
    }
    return res.status(200).json({
      status: "success",
      data: newSts,
    });
  } catch (err) {
    console.log(err.message);
    return res.status(200).json({
      status: "failed",
      message: "Failed to get dashboard",
    });
  }
});

router.get("/:type", async (req, res) => {
  try {
    if (req?.params?.type) {
      let pipeline = [
        {
          $match: {
            $and: [
              { created_at: { $gte: moment().startOf("year").valueOf() } },
              { created_at: { $lte: moment().endOf("year").valueOf() } },
            ],
          },
        },
        {
          $group: {
            _id: {
              district: "$district",
              subDivision: "$tehsil",
            },
            size: { $sum: 1 },
          },
        },
        {
          $project: {
            district: "$_id.district",
            tehshil: "$_id.subDivision",
            size: "$size",
            _id: 0,
          },
        },
        {
          $group: {
            _id: "$district",
            size: { $sum: "$count" },
            data: {
              $push: {
                name: "$$ROOT.tehshil",
                size: "$$ROOT.size",
              },
            },
          },
        },
        {
          $project: {
            name: "$_id",
            children: "$data",
            size: "$size",
            _id: 0,
          },
        },
      ];
      const data = await cardSch.aggregate(pipeline);
      return res.status(200).json({
        status: "success",
        data,
      });
    } else {
      return res.status(500).json({
        error: "failed to get data.",
        message: "Type is missing.",
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: "failed to get data.",
      message: error.message || "Something went wrong.",
    });
  }
});

// const queryMapper = {
//   TODAY: "day",
//   "THIS WEEK": {
//     current: {
//       created_at: {
//         $gte: moment().startOf("week").valueOf(),
//         $lte: moment().endOf("week").valueOf(),
//       },
//     },
//     previous: {
//       created_at: {
//         $gte: moment().subtract(1, "weeks").startOf("week").valueOf(),
//         $lte: moment().subtract(1, "weeks").endOf("week").valueOf(),
//       },
//     },
//   },
//   "THIS MONTH": {
//     current: {
//       created_at: {
//         $gte: moment().startOf("month").valueOf(),
//         $lte: moment().endOf("month").valueOf(),
//       },
//     },
//     previous: {
//       created_at: {
//         $gte: moment().subtract(1, "weeks").startOf("months").valueOf(),
//         $lte: moment().subtract(1, "weeks").endOf("months").valueOf(),
//       },
//     },
//   },
// };

// const customQueryMapper = {
//   ALL: {},
//   CUSTOM: (start = null, end = null) => {
//     return {
//       created_at: {
//         $gte: moment(start).startOf("day").format(),
//         $lte: end
//           ? moment(end).endOf("day").format()
//           : moment(start).endOf("day").format(),
//       },
//     };
//   },
// };

// const getUserStats = async (req, userSch) => {
//   const duration = req.query.duration;
//   const currentQuery = [];
//   const previousQuery = [];
//   if (queryMapper[duration]) {
//     currentQuery.push({
//       $match: {
//         created_at: {
//           $gte: moment().startOf(TODAY[duration]).valueOf(),
//           $lte: moment().endOf(TODAY[duration]).valueOf(),
//         },
//       },
//     });

//     previousQuery.push({
//       $match: {
//         created_at: {
//           $gte: moment()
//             .subtract(1, `${TODAY[duration]}s`)
//             .startOf(TODAY[duration])
//             .valueOf(),
//           $lte: moment()
//             .subtract(1, `${TODAY[duration]}s`)
//             .endOf(TODAY[duration])
//             .valueOf(),
//         },
//       },
//     });

//     // Current Fetch data
//     const [currentUserStats = {}] = await userSch.aggregate([
//       ...currentQuery,
//       {
//         $group: {
//           _id: "$status",
//           count: { $sum: 1 },
//         },
//       },
//       {
//         $group: {
//           _id: null,
//           results: {
//             $push: {
//               k: "$_id",
//               v: "$count",
//             },
//           },
//         },
//       },
//       {
//         $replaceRoot: {
//           newRoot: { $arrayToObject: "$results" },
//         },
//       },
//       {
//         $project: {
//           verified_users: "$Verified",
//           suspended_users: "$Suspended",
//           rejected_users: "$Rejected",
//           un_verified_users: { $sum: ["$Unverified", "$Verification Pending"] },
//           verification_pending_users: "$Verification Pending",
//         },
//       },
//     ]);

//   }
//   //   Get Purrent data by group
//   const queryCurrentActiveUsers = [
//     {
//       last_fetch: {
//         $gte: parseInt(Date.now()) - 5 * 24 * 60 * 60 * 1000,
//       },
//     },
//     { status: "Verified" },
//   ];
//   if (!isEmpty(currentQuery)) {
//     queryCurrentActiveUsers.push(currentQuery[0]["$match"]);
//   }

//   const currentActiveUsers = await userSch.countDocuments({
//     $and: queryCurrentActiveUsers,
//   });
//   const queryCurrentTotalUsers = [];
//   if (req.query.duration && req.query.duration === "string") {
//     queryCurrentTotalUsers.push(queryMapper[req.query.duration].current);
//   } else if (req.query.duration) {
//     queryCurrentTotalUsers.push(
//       queryMapper.CUSTOM(req.query?.duration, req.query.till_duration)
//     );
//   }
//   const totalUser = await userSch.countDocuments(
//     typeof req.query.duration === "string"
//       ? queryMapper[req.query.duration]
//       : queryMapper.CUSTOM(req.query?.duration, req.query.till_duration)
//   );

//   //   Get Perivous Data by group
//   const [previousUserStats = {}] = await userSch.aggregate([
//     ...previousQuery,
//     {
//       $group: {
//         _id: "$status",
//         count: { $sum: 1 },
//       },
//     },
//     {
//       $group: {
//         _id: null,
//         results: {
//           $push: {
//             k: "$_id",
//             v: "$count",
//           },
//         },
//       },
//     },
//     {
//       $replaceRoot: {
//         newRoot: { $arrayToObject: "$results" },
//       },
//     },
//     {
//       $project: {
//         verified_users: "$Verified",
//         suspended_users: "$Suspended",
//         rejected_users: "$Rejected",
//         un_verified_users: { $sum: ["$Unverified", "$Verification Pending"] },
//         verification_pending_users: "$Verification Pending",
//       },
//     },
//   ]);

//   return {
//     current: { ...currentUserStats },
//     previous: { ...previousUserStats },
//     // active_users: active,
//     // inactive_users: result.verified_users - active,
//     // total_users: totalUser,
//   };
// };

// const getCardStats = async (req, cardSch) => {
//   const query = [];
//   if (req.query.duration) {
//     query.push({
//       $match:
//         typeof req.query.duration === "string"
//           ? queryMapper[req.query.duration]
//           : queryMapper.CUSTOM(req.query?.duration, req.query.till_duration),
//     });
//   }
//   const [result = {}] = await cardSch.aggregate([
//     ...query,
//     {
//       $group: {
//         _id: "$status",
//         count: { $sum: 1 },
//       },
//     },
//     {
//       $group: {
//         _id: null,
//         results: {
//           $push: {
//             k: "$_id",
//             v: "$count",
//           },
//         },
//       },
//     },
//     {
//       $replaceRoot: {
//         newRoot: { $arrayToObject: "$results" },
//       },
//     },
//     {
//       $project: {
//         delivered_cards: "$DELIVERED",
//         discard_cards: "$DISCARDED",
//         printed: "$PRINTED",
//         undelivered_cards: "$UNDELIVERED",
//         available_to_print: "$SUBMITTED",
//       },
//     },
//   ]);

//   const totalCards = await cardSch.countDocuments(
//     typeof req.query.duration === "string"
//       ? queryMapper[req.query.duration]
//       : queryMapper.CUSTOM(req.query?.duration, req.query.till_duration)
//   );
//   return { ...result, total_cards: totalCards };
// };

// router.get("/admin", async (req, res) => {
//   try {
//     if (req.query.token != null) {
//       const token = await tokenSch.findOne({ token: req.query.token });
//       if (token == null) {
//         return res.status(200).json({
//           status: "failed",
//           message: "Invalid Token",
//         });
//       }
//       const user = await userSch.findOne({
//         _id: token.uid,
//         status: "Verified",
//       });
//       if (!user) {
//         return res.status(200).json({
//           status: "failed",
//           message: "Access Denied",
//         });
//       }
//       //   active_users: 0;
//       //   total_users: 0;
//       //   inactive_users: 0;

//       //   available_to_print: 0;
//       //   delivered_cards: 0;
//       //   diagnostic_centers: 0;
//       //   discard_cards: 0;
//       //   hospitals: 0;
//       //   medicals: 0;
//       //   printed: 0;
//       //   total_cards: 0;
//       //   total_hospital: 0;
//       //   undelivered_cards: 0;

//       //   Get User stats
//       const userStats = await getUserStats(req, userSch);
//       const cardStats = await getCardStats(req, cardSch);
//       return res.status(200).json({
//         status: "success",
//         data: { userStats, cardStats },
//       });
//     } else {
//       return res.status(401).json({
//         status: "Failed",
//         message: "Token Missing",
//       });
//     }
//   } catch (error) {
//     console.log("error", error);

//     return res.status(500).json({
//       status: "Failed",
//       message: "Something when wrong.",
//     });
//   }
// });

module.exports = router;
