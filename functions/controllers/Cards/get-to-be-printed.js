const { userSchema, cardSchema } = require("../../models");
// REMOVE THIS ROUTE ONCE GET-CARD-DATA-BY-LOCATION IS COMPLETED
const getToBePrintedCards = async (req, res, next) => {
  try {
    const userdetails = req.userDetails;

    const tokenUser = await userSchema.findById(userdetails.id);
    if (tokenUser == null || tokenUser.status != "Verified") {
      return res.status(200).json({
        status: "failed",
        message:
          tokenUser == null
            ? "Access Denied"
            : `${tokenUser.status} User: Access Denied`,
      });
    }
    var qry = {
      userId: null,
    };
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
    if (req?.query?.isPrintMode) {
      qry["$or"] = [{ created_at: { $lt: parseInt(req?.query?.isPrintMode) } }];
    }
    if (req.query.q != null) {
      // if((q.toString().length==6) && (parseInt(q.toString())>0)){
      //     qry.
      // }
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
            $in: ["REPRINT", "SUBMITTED"],
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
    if ((req.query.created_by || "") != "") {
      qry.created_by_uid = req.query.created_by;
    }

    const documentCount = await cardSchema.countDocuments({
      status: { $in: ["REPRINT", "SUBMITTED"] },
      ...qry,
    });

    let cardData = await cardSchema.aggregate([
      {
        $match: {
          status: { $in: ["REPRINT", "SUBMITTED"] },
          ...qry,
        },
      },
      {
        $sort: {
          ...(req?.query?.sortBy && { status_updated_at: -1 }),
          created_at: -1,
        },
      },
      {
        $addFields: {
          unifiedLocation: {
            $concat: ["$district", " / ", "$tehsil"], //"$state", " / ",
          },
        },
      },
      {
        $group: {
          _id: {
            location: "$unifiedLocation",
            createdBy: "$created_by_uid",
          },
          cards: { $push: "$$ROOT" },
          // cardCount: { $sum: 1 },
        },
      },
      {
        $addFields: {
          cards: {
            $slice: [
              "$cards", // The array to slice
              documentCount > parseInt(req.query.limit || "40")
                ? parseInt(req.query.page || 0) *
                  parseInt(req.query.limit || "40")
                : 0, // Skip amount
              parseInt(req.query.limit || "40"), // Limit
            ],
          },
        },
      },
      {
        $addFields: {
          cardCount: { $size: "$cards" },
        },
      },
      {
        $sort: {
          cardCount: -1,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id.createdBy",
          foreignField: "uid",
          pipeline: [
            {
              $project: {
                _id: 0,
                uid: 1,
                name: 1,
                email: 1,
                phone: 1,
                team_leader_id: 1, // Include TL ID for the next lookup
              },
            },
          ],
          as: "userDetails",
        },
      },
      {
        $unwind: {
          path: "$userDetails",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userDetails.team_leader_id",
          foreignField: "tl_id",
          pipeline: [
            {
              $project: {
                _id: 0,
                uid: 1,
                name: 1,
                email: 1,
                phone: 1,
              },
            },
          ],
          as: "teamLeaderDetails",
        },
      },
      {
        $sort: {
          cardCount: -1,
        },
      },
      {
        $match: { cards: { $ne: [] } },
      },
      {
        $group: {
          _id: "$_id.location",
          cards: { $push: "$$ROOT" },
          totalCards: { $sum: "$cardCount" },
        },
      },
      {
        $sort: {
          totalCards: -1,
        },
      },
    ]);

    let cardIds = [];
    // let allCardCount = {};
    // cardData = groupBy(cardData, (cardDetails) => {
    //   if (allCardCount[cardDetails._id.location]) {
    //     allCardCount[cardDetails._id.location] += cardDetails.cardCount;
    //   } else {
    //     allCardCount[cardDetails._id.location] = cardDetails.cardCount;
    //   }
    //   return cardDetails._id.location;
    // });
    let totalDocs = 0;
    cardData.forEach((key) => {
      key.cards.forEach((data) =>
        data.cards.forEach((c) => {
          totalDocs += 1;
          cardIds.push(c._id);
        })
      );
    });
    // cardData.forEach((c) => (cardIds = cardIds.concat(c.cardIds)));

    // cardIds =
    //   cardIds?.map(function (doc) {
    //     return doc._id.toString();
    //   }) || [];

    const tehsilCount = await cardSchema.aggregate([
      // !isEmpty(qry) ? { $match: qry } : null,
      { $match: { status: { $in: ["REPRINT", "SUBMITTED"] }, userId: null } },
      {
        $group: {
          _id: "$tehsil",
          totalCards: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          tehsil: "$_id",
          totalCards: 1,
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $arrayToObject: [[{ k: "$tehsil", v: "$totalCards" }]],
          },
        },
      },
    ]);
    let newTehsilCount = {};
    tehsilCount.forEach((object) => {
      Object.keys(object).forEach((key) => (newTehsilCount[key] = object[key]));
    });

    const totalCards = await cardSchema.countDocuments({ userId: null });
    const totalQryCards = await cardSchema.countDocuments(qry);
    var x = {
      userId: null,
    };
    for (let v of Object.keys(qry)) {
      if (v != "status") {
        x[v] = qry[v];
      }
    }
    x.status = { $in: ["REPRINT", "SUBMITTED"] };
    const totalPrintCardsShowing = await cardSchema.countDocuments(x);
    const totalPrintCards = await cardSchema.countDocuments({
      userId: null,
      status: { $in: ["REPRINT", "SUBMITTED"] },
      ...(req?.query?.isPrintMode && {
        $or: [
          {
            created_at: {
              $lt: parseInt(req?.query?.isPrintMode),
            },
          },
        ],
      }),
    });
    return res.status(200).json({
      status: "success",
      page_number:
        documentCount > parseInt(req.query.limit || "40")
          ? req.query.page || "0"
          : "0",
      total: totalCards,
      cardIds,
      total_showing: totalQryCards,
      total_print_card: totalPrintCards,
      total_print_card_showing: totalPrintCardsShowing,
      total_documents_per_page: totalDocs,
      data: cardData,
      tehsilCount: newTehsilCount,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = getToBePrintedCards;
