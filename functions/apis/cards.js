const express = require("express");
const router = express.Router();
const cardSch = require("../models/card");
const tokenSch = require("../models/token");
const userSch = require("../models/user");
const areaSch = require("../models/area");
const tehsilSch = require("../models/new_tehsil");
const { isEmpty, groupBy } = require("lodash");
const moment = require("moment/moment");

require("padleft");

router.get("/", async (req, res) => {
  // const cds = await cardSch.find();
  // for (let x of cds) {
  //     await cardSch.findByIdAndUpdate(x._id, { status: "SUBMITTED" });
  // }
  // return res.status(200).json({
  //     data: cds
  // });
  // console.log(await tehsilSch.findOne({ name: "Tehsil2" }));
  // console.log(await areaSch.findOne({ name: "AMBABADOD" }));
  // // await areaSch.findByIdAndUpdate("63c910a0eeae016501bd42a6", { tehsil: "63d18cabdc6cfb6f839470a9" });
  // return res.status(200).json({
  //     data: await cardSch.find({ status: "DELIVERED" }).sort({ created_at: -1 })
  // });
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

  const tokenUser = await userSch.findById(token.uid);
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
  // else {
  //   qry["$or"] = [
  //     { created_at: { $lt: moment().startOf("day").hour(10).valueOf() } }, // Condition 1: Created before 10:00 AM
  //     // { created_at: { $lte: moment().startOf("day").hour(22).valueOf() } }, // Condition 2: Created before 10:00 PM
  //   ];
  // }
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
    const data = await cardSch
      .find(qry)
      .sort({
        // tehsil: 1,
        // created_by: 1,
        created_at: req.query.sortBy ? 1 : -1,
      })
      .skip(parseInt(req.query.page || 0) * parseInt(req.query.limit || "40"))
      .limit(parseInt(req.query.limit || "40"));
    const totalCards = await cardSch.countDocuments();
    const totalQryCards = await cardSch.countDocuments(qry);
    var x = {};
    for (let v of Object.keys(qry)) {
      if (v != "status") {
        x[v] = qry[v];
      }
    }
    x.status = { $in: ["REPRINT", "SUBMITTED"] };
    console.log("total x", x);
    const totalPrintCardsShowing = await cardSch.countDocuments(x);
    const totalPrintCards = await cardSch.countDocuments({
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
    const submitted = await cardSch.countDocuments({
      $or: [{ status: "SUBMITTED" }, { status: "PRINTED" }],
      created_by: tokenUser._id,
    });
    const delivered = await cardSch.countDocuments({
      status: "DELIVERED",
      created_by: tokenUser._id,
    });
    const others = await cardSch.countDocuments({
      status: {
        $in: ["UNDELIVERED", "DISCARDED"],
      },
      created_by: tokenUser._id,
    });
    const total = await cardSch.countDocuments({
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
        await cardSch.aggregate([
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
    const documentCount = await cardSch.countDocuments(qry);
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
      skip = parseInt(req.query.page || 0) * parseInt(req.query.limit || "40");
      sort = { created_at: -1, tehsil: 1, created_by: 1 };
    }
    const resp = await cardSch
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
        x.status = parseStatus(x.status);
      }
      x.address = `${x.area}, ${x.tehsil}, ${x.district}, ${x.state}`;
      return x;
    });
    if (req.query.responseType == "LIST") {
      const totalCards = await cardSch.countDocuments({
        // $or: [
        //   { created_at: { $lt: moment().startOf("day").hour(10).valueOf() } },
        // ],
      });
      const totalQryCards = await cardSch.countDocuments(qry);
      var x = {};
      for (let v of Object.keys(qry)) {
        if (v != "status") {
          x[v] = qry[v];
        }
      }
      x.status = { $in: ["REPRINT", "SUBMITTED"] };

      const totalPrintCardsShowing = await cardSch.countDocuments(x);
      const totalPrintCards = await cardSch.countDocuments({
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
          const str = `${weekName(date.getDay())} ${date.getDate()} ${monthName(
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
});

router.get("/to-be-printed", async (req, res) => {
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

  const tokenUser = await userSch.findById(token.uid);
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

  const documentCount = await cardSch.countDocuments({
    status: { $in: ["REPRINT", "SUBMITTED"] },
    ...qry,
  });

  // New aggregation
  // db.getCollection("cards").aggregate([
  //   {
  //     $match: {
  //       status: { $in: ["REPRINT", "SUBMITTED"] },
  //     },
  //   },

  //   {
  //     $sort: {
  //       created_at: -1,
  //     },
  //   },

  //   {
  //     $lookup: {
  //       from: "users",
  //       localField: "created_by_uid",
  //       foreignField: "uid",
  //       pipeline: [
  //         {
  //           $project: {
  //             _id: 1,
  //             uid: 1,
  //             name: 1,
  //             email: 1,
  //             phone: 1,
  //             team_leader_id: 1, // Include TL ID for the next lookup
  //           },
  //         },
  //       ],
  //       as: "userDetails",
  //     },
  //   },

  //   {
  //     $addFields: {
  //       userDetails: { $arrayElemAt: ["$userDetails", 0] }, // Convert array to object
  //     },
  //   },

  //   {
  //     $group: {
  //       _id: {
  //         location: "$userDetails.team_leader_id",
  //       },
  //       cards: { $push: "$$ROOT" },
  //       cardCount: { $sum: 1 },
  //     },
  //   },

  //   {
  //     $addFields: {
  //       cards: {
  //         $slice: [
  //           "$cards", // The array to slice
  //           0 * 100, // Skip amount
  //           100, // Limit
  //         ],
  //       },
  //     },
  //   },

  //   {
  //     $unwind: "$cards", // Unwind the cards to access created_by_uid
  //   },

  //   {
  //     $group: {
  //       _id: {
  //         team_leader_id: "$_id.location", // Keep grouping by team leader ID
  //         created_by_uid: "$cards.created_by_uid", // Group by created_by_uid within each team leader
  //       },
  //       userDetails: { $first: "$cards.userDetails" },
  //       cards: { $push: "$cards" }, // Push the card data for each user
  //       cardCount: { $sum: 1 }, // Count the number of cards for each user
  //     },
  //   },

  //   {
  //     $sort: {
  //       cardCount: -1,
  //     },
  //   },

  //   {
  //     $group: {
  //       _id: "$_id.team_leader_id", // Final grouping by team_leader_id
  //       users: {
  //         $push: {
  //           created_by_uid: "$_id.created_by_uid",
  //           userDetails: "$userDetails",
  //           cards: "$cards",
  //           cardCount: "$cardCount",
  //         },
  //       },
  //       totalCardCount: { $sum: "$cardCount" }, // Total card count for each team leader
  //     },
  //   },
  //   {
  //     $sort: {
  //       totalCardCount: -1,
  //     },
  //   },
  //   {
  //     $lookup: {
  //       from: "users",
  //       localField: "_id",
  //       foreignField: "tl_id",
  //       pipeline: [
  //         {
  //           $match: {
  //             role: "TL",
  //           },
  //         },
  //         {
  //           $project: {
  //             _id: 0,
  //             uid: 1,
  //             name: 1,
  //             email: 1,
  //             phone: 1,
  //             tl_id: 1,
  //           },
  //         },
  //       ],
  //       as: "teamLeaderDetails",
  //     },
  //   },

  //   {
  //     $addFields: {
  //       teamLeaderDetails: { $arrayElemAt: ["$teamLeaderDetails", 0] }, // Convert array to object
  //     },
  //   },
  // ]);

  //-----------------------------------------------------------------------------------------------------------

  // let cardData = await cardSch.aggregate([
  //   {
  //     $match: {
  //       status: { $in: ["REPRINT", "SUBMITTED"] },
  //       ...qry,
  //     },
  //   },

  //   {
  //     $sort: {
  //       created_at: -1,
  //     },
  //   },

  //   {
  //     $lookup: {
  //       from: "users",
  //       localField: "created_by_uid",
  //       foreignField: "uid",
  //       pipeline: [
  //         {
  //           $project: {
  //             _id: 1,
  //             uid: 1,
  //             name: 1,
  //             email: 1,
  //             phone: 1,
  //             team_leader_id: 1, // Include TL ID for the next lookup
  //           },
  //         },
  //       ],
  //       as: "userDetails",
  //     },
  //   },

  //   {
  //     $addFields: {
  //       userDetails: { $arrayElemAt: ["$userDetails", 0] }, // Convert array to object
  //     },
  //   },

  //   {
  //     $group: {
  //       _id: {
  //         location: "$userDetails.team_leader_id",
  //       },
  //       cards: { $push: "$$ROOT" },
  //       cardCount: { $sum: 1 },
  //     },
  //   },

  //   {
  //     $addFields: {
  //       cards: {
  //         $slice: [
  //           "$cards", // The array to slice
  //           0 * 100, // Skip amount
  //           100, // Limit
  //         ],
  //       },
  //     },
  //   },

  //   {
  //     $unwind: "$cards", // Unwind the cards to access created_by_uid
  //   },

  //   {
  //     $group: {
  //       _id: {
  //         team_leader_id: "$_id.location", // Keep grouping by team leader ID
  //         created_by_uid: "$cards.created_by_uid", // Group by created_by_uid within each team leader
  //       },
  //       userDetails: { $first: "$cards.userDetails" },
  //       cards: { $push: "$cards" }, // Push the card data for each user
  //       cardCount: { $sum: 1 }, // Count the number of cards for each user
  //       cardIds: { $push: "$cards._id" },
  //     },
  //   },

  //   {
  //     $sort: {
  //       cardCount: -1,
  //     },
  //   },

  //   {
  //     $group: {
  //       _id: "$_id.team_leader_id", // Final grouping by team_leader_id
  //       users: {
  //         $push: {
  //           created_by_uid: "$_id.created_by_uid",
  //           userDetails: "$userDetails",
  //           cards: "$cards",
  //           cardCount: "$cardCount",
  //           //             cardIds: "$cardIds"
  //         },
  //       },
  //       cardIds: { $push: "$cardIds" },
  //       totalCardCount: { $sum: "$cardCount" }, // Total card count for each team leader
  //     },
  //   },
  //   {
  //     $sort: {
  //       totalCardCount: -1,
  //     },
  //   },
  //   {
  //     $project: {
  //       users: 1,
  //       totalCardCount: 1,
  //       cardIds: {
  //         $reduce: {
  //           input: "$cardIds", // Flatten the collected arrays
  //           initialValue: [],
  //           in: { $concatArrays: ["$$value", "$$this"] },
  //         },
  //       },
  //     },
  //   },
  //   {
  //     $lookup: {
  //       from: "users",
  //       localField: "_id",
  //       foreignField: "tl_id",
  //       pipeline: [
  //         {
  //           $match: {
  //             role: "TL",
  //           },
  //         },
  //         {
  //           $project: {
  //             _id: 0,
  //             uid: 1,
  //             name: 1,
  //             email: 1,
  //             phone: 1,
  //             tl_id: 1,
  //           },
  //         },
  //       ],
  //       as: "teamLeaderDetails",
  //     },
  //   },

  //   {
  //     $addFields: {
  //       teamLeaderDetails: { $arrayElemAt: ["$teamLeaderDetails", 0] }, // Convert array to object
  //     },
  //   },
  // ]);

  let cardData = await cardSch.aggregate([
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
    // ...(req?.query?.sortBy
    //   ? [
    //       {
    //         $sort: {
    //           status_updated_at: -1,
    //         },
    //       },
    //     ]
    //   : []),
    // ...(documentCount > parseInt(req.query.limit || "40")
    //   ? [
    //       {
    //         $skip:
    //           parseInt(req.query.page || 0) * parseInt(req.query.limit || "40"), // Skip documents for previous pages
    //       },
    //     ]
    //   : []),
    // {
    //   $limit: parseInt(req.query.limit || "40"), // Limit the number of documents to the page size
    // },
    {
      $addFields: {
        unifiedLocation: {
          $concat: ["$state", "/", "$district", "/", "$tehsil"],
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

  const tehsilCount = await cardSch.aggregate([
    // !isEmpty(qry) ? { $match: qry } : null,
    { $match: { status: { $in: ["REPRINT", "SUBMITTED"] } } },
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

  const totalCards = await cardSch.countDocuments();
  const totalQryCards = await cardSch.countDocuments(qry);
  var x = {};
  for (let v of Object.keys(qry)) {
    if (v != "status") {
      x[v] = qry[v];
    }
  }
  x.status = { $in: ["REPRINT", "SUBMITTED"] };
  const totalPrintCardsShowing = await cardSch.countDocuments(x);
  const totalPrintCards = await cardSch.countDocuments({
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
});

router.get("/card-users", async (req, res) => {
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
    const userList =
      (await cardSch.aggregate([
        ...(req.query.status
          ? [
              {
                $match: {
                  status: { $in: ["REPRINT", "SUBMITTED"] },
                },
              },
            ]
          : []),
        {
          $group: {
            _id: "$created_by",
            count: { $sum: 1 },
          },
        },
        // {
        //   $unwind: {
        //     path: "$userIds",
        //   },
        // },
        {
          $lookup: {
            from: "users",
            let: { userIds: { $toObjectId: "$_id" } },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$_id", "$$userIds"] }, // Match the converted ObjectId
                },
              },
              {
                $project: {
                  _id: "$_id",
                  name: "$name",
                  uid: "$uid",
                },
              },
            ],
            as: "userDetails",
          },
        },
        {
          $project: {
            userDetails: { $arrayElemAt: ["$userDetails", 0] },
            count: 1,
          },
        },

        {
          $replaceRoot: {
            newRoot: {
              $mergeObjects: ["$userDetails", { count: "$count" }],
            },
          },
        },
        {
          $sort: {
            name: 1,
            // count: -1,
          },
        },
      ])) || [];
    return res.status(200).json({
      status: "success",
      userList: userList,
    });
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: "Something went wrong while getting users.",
    });
  }
});

function parseStatus(status) {
  switch (status) {
    case "PRINTED":
      return "SUBMITTED";
    // case 'DISCARDED':
    // case 'UNDELIVERED': return 'OTHER';
  }
  return status;
}

router.get("/:id", getCard, async (req, res) => {
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
    if (res.card != null) {
      return res.status(200).json({
        status: "success",
        data: res.card,
      });
    } else {
      return res.status(200).json({
        status: "failed",
        message: "Card not found",
      });
    }
  } catch (err) {
    return res.status(200).json({
      status: "failed",
      message: err.message,
    });
  }
});

router.post("/", async (req, res) => {
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
      console.log(gmp);
      const ntehsil = await tehsilSch.findOne({ name: tehsil });
      console.log(ntehsil);
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
});

router.patch("/:id", async (req, res) => {
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
    var fields = {};
    if (req.body.image != null) {
      fields.image = req.body.image;
    }
    if (req.body.name != null) {
      fields.name = req.body.name;
    }
    if (req.body.birth_year != null) {
      fields.birth_year = req.body.birth_year;
    }
    if (req.body.gender != null) {
      fields.gender = req.body.gender;
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
    if (req.body.tehsil != null) {
      fields.tehsil = req.body.tehsil;
    }
    if (req.body.area != null) {
      fields.area = req.body.area;
    }
    if (req.body.phone != null) {
      fields.phone = req.body.phone;
    }
    if (req.body.father_husband_name != null) {
      fields.father_husband_name = req.body.father_husband_name;
    }
    if (req.body.blood_group != null) {
      fields.blood_group = req.body.blood_group;
    }
    if (req.body.emergency_contact != null) {
      fields.emergency_contact = req.body.emergency_contact;
    }
    // if (req.body.issue_date != null) {
    //     fields.issue_date = parseInt(req.body.issue_date.toString());
    // }
    if (req.body.expiry_date != null) {
      fields.expiry_date = parseInt(req.body.expiry_date.toString());
    }
    if (req.body.expiry_years != null) {
      fields.expiry_years = parseInt(req.body.expiry_years.toString());
    }
    if (req.body.discard_reason != null) {
      fields.discard_reason = req.body.discard_reason;
    }

    const oldCard = await cardSch.findById(req.params.id);

    if (oldCard.status == "PRINTED" || userr.role == "ADMIN") {
      if (req.body.status != null) {
        if (
          [
            "SUBMITTED",
            "PRINTED",
            "UNDELIVERED",
            "DELIVERED",
            "DISCARDED",
            "RTO",
            "REPRINT",
          ].includes(req.body.status.toString().toUpperCase())
        ) {
          fields.status = req.body.status.toString().toUpperCase();
        }
      }
      if (oldCard.status != req.body.status && (req.body.status || "") != "") {
        var upMap = {};
        if (req.body.status == "SUBMITTED") {
          upMap = {
            $inc: {
              p2_count: 1,
            },
          };
        }
        if (req.body.status == "PRINTED") {
          upMap = {
            $inc: {
              p_count: 1,
            },
          };
          fields.isPrintedPreviously = true;
        }
        if (req.body.status == "DELIVERED") {
          upMap = {
            $inc: {
              d_count: 1,
            },
          };
        }
        if (req.body.status == "UNDELIVERED") {
          upMap = {
            $inc: {
              ud_count: 1,
            },
          };
        }
        if (req.body.status == "DISCARDED") {
          upMap = {
            $inc: {
              dis_count: 1,
            },
          };
        }
        if (req.body.status == "REPRINT") {
          upMap = {
            $inc: {
              reprint_count: 1,
            },
          };
        }
        if (req.body.status == "RTO") {
          upMap = {
            $inc: {
              RTO_count: 1,
            },
          };
        }
        if (oldCard.status == "SUBMITTED") {
          upMap["$inc"].p2_count = -1;
        }
        if (oldCard.status == "PRINTED") {
          upMap["$inc"].p_count = -1;
        }
        if (oldCard.status == "DELIVERED") {
          upMap["$inc"].d_count = -1;
        }
        if (oldCard.status == "UNDELIVERED") {
          upMap["$inc"].ud_count = -1;
        }
        if (oldCard.status == "DISCARDED") {
          upMap["$inc"].dis_count = -1;
        }

        // fields["$push"] = {
        //   status_history: {
        //     previous_status: oldCard.status,
        //     updated_status: req.body.status,
        //     created_at: new Date().valueOf(),
        //     ...(req.body?.discard_reason && {
        //       reason: req.body.discard_reason,
        //     }),
        //     updated_by: {
        //       name: userr.name,
        //       phone: userr.phone,
        //       _id: userr._id,
        //       uid: userr.uid,
        //     },
        //   },
        // };

        console.log(upMap);
        const usr = await userSch.findByIdAndUpdate(oldCard.created_by, upMap);
      }
      fields["$push"] = {
        status_history: {
          previous_status: oldCard.status,
          updated_status: req.body.status,
          created_at: new Date().valueOf(),
          ...(req.body?.discard_reason && {
            reason: req.body.discard_reason,
          }),
          updated_by: {
            name: userr.name,
            phone: userr.phone,
            _id: userr._id,
            uid: userr.uid,
          },
        },
      };
      fields.status_updated_at = new Date();
    }

    const cardUpdate = await cardSch.findByIdAndUpdate(req.params.id, fields);
    const card = await cardSch.findById(req.params.id);
    return res.status(200).json({
      status: "success",
      message: "Card updated successfully",
      data: card,
      cardUpdate,
    });
  } catch (err) {
    return res.status(200).json({
      status: "failed",
      message: err.message,
    });
  }
});

module.exports = router;

async function getCard(req, res, next) {
  let card;
  try {
    card = await cardSch.findById(req.params.id);
    if (card == null) {
      return res.status(200).json({
        status: "failed",
        message: "Card not found!",
      });
    }
  } catch (err) {
    return res.status(200).json({
      status: "failed",
      message: err.message,
    });
  }
  card.address = `${card.area}, ${card.tehsil}, ${card.district}, ${card.state}`;
  res.card = card;
  next();
}

router.post("/moveStatus", async (req, res) => {
  try {
    const token = await tokenSch.findOne({ token: req.query.token || "" });
    if (token == null) {
      return res.status(200).json({
        status: "failed",
        message: "Invalid Token",
      });
    }
    const userr = await userSch.findById(token.uid);
    if (userr == null || userr.role != "ADMIN") {
      return res.status(200).json({
        status: "failed",
        message: "Access Denied",
      });
    }
    const list = (req.body.uids || "").toString().split(",");
    console.log("list", list);

    var ups = {};
    for (let x of list) {
      const crd = await cardSch.findByIdAndUpdate(x, {
        status: "PRINTED",
        status_updated_at: new Date(),
        $push: {
          status_history: {
            updated_status: "PRINTED",
            created_at: new Date().valueOf(),
            updated_by: {
              name: userr.name,
              phone: userr.phone,
              _id: userr._id,
              uid: userr.uid,
            },
          },
        },
      });
      ups[crd.created_by] = (ups[crd.created_by] || 0) + 1;
    }
    for (let x of Object.keys(ups)) {
      await userSch.findByIdAndUpdate(x, {
        $inc: {
          p_count: ups[x],
          p2_count: 0 - ups[x],
        },
      });
    }
    return res.status(200).json({
      status: "success",
      message: "Card updated successfully",
    });
  } catch (err) {
    return res.status(200).json({
      status: "failed",
      message: err.message,
    });
  }
});

router.patch("/updateStatus", async (req, res) => {
  try {
    if (req.query.token == null) {
      return res.status(200).json({
        status: "failed",
        message: "Invalid Token",
      });
    }
    if (!req.query.id || req.query.status) {
      return res.status(200).json({
        status: "failed",
        message: "Id and status Required",
      });
    }
    if (
      ![
        "SUBMITTED",
        "PRINTED",
        "UNDELIVERED",
        "DELIVERED",
        "DISCARDED",
      ].includes(req.body.status.toString().toUpperCase())
    ) {
      return res.status(200).json({
        status: "failed",
        message: "Invalid Status",
      });
    }
    const token = await tokenSch.findOne({ token: req.query.token });
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

    const oldCard = await cardSch.findOne(
      { _id: req.query.id },
      {
        status: 1,
      }
    );

    const cardUpdate = await cardSch.updateOne(req.query.id, {
      status: req.body.status.toString().toUpperCase(),
      $push: {
        status_history: {
          previous_status: oldCard.status,
          updated_status: req.body.status,
          created_at: new Date().valueOf(),
          updated_by: {
            name: userr.name,
            phone: userr.phone,
            _id: userr._id,
            uid: userr.uid,
          },
        },
      },
    });
    return res.status(200).json({
      status: "success",
      message: "Card updated successfully",
      data: card,
    });
  } catch (error) {
    return res.status(200).json({
      status: "failed",
      message: err.message,
    });
  }
});

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
