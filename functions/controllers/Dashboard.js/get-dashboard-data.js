const { isEmpty } = require("lodash");
const {
  tokenSchema,
  userSchema,
  cardSchema,
  hospitalSchema,
} = require("../../models");
const moment = require("moment");
const { CustomError } = require("../../utils/custom-errors");
const { ErrorEnums } = require("../../Enums");

const getDocumentCount = async ({
  query = {},
  dbSchema,
  useStatusUpdatedAt = false,
  isAvailableCardStatus = false,
}) => {
  if (dbSchema) {
    const todaysDate = moment().startOf("day").valueOf();
    const yesterdayDateStart = moment()
      .subtract(1, "day")
      .startOf("day")
      .valueOf();
    const yesterdayDateEnd = moment().subtract(1, "day").endOf("day").valueOf();
    return {
      today: await dbSchema.countDocuments({
        ...(useStatusUpdatedAt
          ? { status_updated_at: { $gte: new Date(todaysDate) } }
          : isAvailableCardStatus
          ? {
              $or: [
                {
                  status_updated_at: {
                    $gte: new Date(todaysDate),
                  },
                },
                {
                  created_at: { $gte: todaysDate },
                },
              ],
            }
          : {
              created_at: { $gte: todaysDate },
            }),
        ...query,
      }),
      yesterday: await dbSchema.countDocuments({
        ...(useStatusUpdatedAt
          ? {
              status_updated_at: {
                $gte: new Date(yesterdayDateStart),
                $lte: new Date(yesterdayDateEnd),
              },
            }
          : isAvailableCardStatus
          ? {
              $or: [
                {
                  status_updated_at: {
                    $gte: new Date(todaysDate),
                    $lte: new Date(yesterdayDateEnd),
                  },
                },
                {
                  created_at: {
                    $gte: yesterdayDateStart,
                    $lte: yesterdayDateEnd,
                  },
                },
              ],
            }
          : {
              created_at: {
                $gte: yesterdayDateStart,
                $lte: yesterdayDateEnd,
              },
            }),
        ...query,
      }),
    };
  }
  return {
    today: 0,
    yesterday: 0,
  };
};

const getDashboardData = async (req, res) => {
  try {
    const user = await userSchema.findById(req.userDetails.id);
    if (isEmpty(user)) {
      throw new CustomError(ErrorEnums.USER_NOT_FOUND);
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
      const totalUser = await userSchema.countDocuments(qry);
      var q = { status: "Unverified" };

      if (qry.created_at != null) {
        q.created_at = qry.created_at;
      }
      const unVerified = await userSchema.countDocuments({
        $or: [{ status: "Unverified" }, { status: "Verification Pending" }],
        ...(qry.created_at && { created_at: qry.created_at }),
      });
      q.status = "Verified";
      const verified = await userSchema.countDocuments(q);
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
      const active = await userSchema.countDocuments(q);
      const inactive = verified - active;
      q = { status: "Suspended" };
      if (qry.created_at != null) {
        q.created_at = qry.created_at;
      }
      const suspended = await userSchema.countDocuments(q);
      q.status = "Rejected";
      const rejected = await userSchema.countDocuments(q);
      // Total card count
      const totalCards = await cardSchema.countDocuments(qry);
      q.status = { $in: ["SUBMITTED", "REPRINT"] };
      let todayTotalCards = 0;
      let yesterdayTotalCards = 0;
      if (user.role == "ADMIN" && req.query.type == "ADMIN") {
        const result = await getDocumentCount({
          dbSchema: cardSchema,
          useStatusUpdatedAt: true,
        });
        todayTotalCards = result.today;
        yesterdayTotalCards = result.yesterday;
      }
      const availableToPrint = await cardSchema.countDocuments(q);
      let availableToPrintTodayCount = 0;
      let availableToPrintYesterdayCount = 0;

      if (user.role == "ADMIN" && req.query.type == "ADMIN") {
        const result = await getDocumentCount({
          dbSchema: cardSchema,
          query: {
            status: { $in: ["SUBMITTED", "REPRINT"] },
          },
          useStatusUpdatedAt: true,
          isAvailableCardStatus: true,
        });
        availableToPrintTodayCount = result.today;
        availableToPrintYesterdayCount = result.yesterday;
      }
      q.status = "PRINTED";
      const printed = await cardSchema.countDocuments(q);
      let printedTodayCount = 0;
      let printedYesterdayCount = 0;

      if (user.role == "ADMIN" && req.query.type == "ADMIN") {
        const result = await getDocumentCount({
          dbSchema: cardSchema,
          query: {
            status: "PRINTED",
          },
          useStatusUpdatedAt: true,
        });
        printedTodayCount = result.today;
        printedYesterdayCount = result.yesterday;
      }
      q.status = "UNDELIVERED";
      const undeliveredCards = await cardSchema.countDocuments(q);
      let undeliveredCardsTodayCount = 0;
      let undeliveredCardsYesterdayCount = 0;

      if (user.role == "ADMIN" && req.query.type == "ADMIN") {
        const result = await getDocumentCount({
          dbSchema: cardSchema,
          query: {
            status: "UNDELIVERED",
          },
          useStatusUpdatedAt: true,
        });
        undeliveredCardsTodayCount = result.today;
        undeliveredCardsYesterdayCount = result.yesterday;
      }
      q.status = "DELIVERED";
      const deliveredCards = await cardSchema.countDocuments(q);

      let deliveredCardsTodayCount = 0;
      let deliveredCardsYesterdayCount = 0;

      if (user.role == "ADMIN" && req.query.type == "ADMIN") {
        const result = await getDocumentCount({
          dbSchema: cardSchema,
          query: {
            status: "DELIVERED",
          },
          useStatusUpdatedAt: true,
        });
        deliveredCardsTodayCount = result.today;
        deliveredCardsYesterdayCount = result.yesterday;
      }

      q.status = "DISCARDED";
      const discarded = await cardSchema.countDocuments(q);

      let discardedCardsTodayCount = 0;
      let discardedCardsYesterdayCount = 0;

      if (user.role == "ADMIN" && req.query.type == "ADMIN") {
        const result = await getDocumentCount({
          dbSchema: cardSchema,
          query: {
            status: "DISCARDED",
          },
          useStatusUpdatedAt: true,
        });
        discardedCardsTodayCount = result.today;
        discardedCardsYesterdayCount = result.yesterday;
      }

      const totalH = await hospitalSchema.countDocuments(qry);

      let totalHospitalTodayCount = 0;
      let totalHospitalYesterdayCount = 0;

      if (user.role == "ADMIN" && req.query.type == "ADMIN") {
        const result = await getDocumentCount({
          dbSchema: hospitalSchema,
        });
        totalHospitalTodayCount = result.today;
        totalHospitalYesterdayCount = result.yesterday;
      }

      q = { category: "hospitalSchema" };
      if (qry.created_at != null) {
        q.created_at = qry.created_at;
      }
      const totalHosp = await hospitalSchema.countDocuments(q);

      let hospitalTodayCount = 0;
      let hospitalYesterdayCount = 0;

      if (user.role == "ADMIN" && req.query.type == "ADMIN") {
        const result = await getDocumentCount({
          dbSchema: hospitalSchema,
          query: { category: "hospitalSchema" },
        });
        hospitalTodayCount = result.today;
        hospitalYesterdayCount = result.yesterday;
      }

      q.category = "Labs & Diagnostic Centers";
      const totalDC = await hospitalSchema.countDocuments(q);

      let totalDCTodayCount = 0;
      let totalDCYesterdayCount = 0;

      if (user.role == "ADMIN" && req.query.type == "ADMIN") {
        const result = await getDocumentCount({
          dbSchema: hospitalSchema,
          query: { category: "Labs & Diagnostic Centers" },
        });
        totalDCTodayCount = result.today;
        totalDCYesterdayCount = result.yesterday;
      }

      q.category = "Medical";
      const totalMedical = await hospitalSchema.countDocuments(q);

      let totalMedicalTodayCount = 0;
      let totalMedicalYesterdayCount = 0;

      if (user.role == "ADMIN" && req.query.type == "ADMIN") {
        const result = await getDocumentCount({
          dbSchema: hospitalSchema,
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
    const cards = await cardSchema
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
          user = await userSchema.findById(a.created_by || "");
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
};

module.exports = getDashboardData;
