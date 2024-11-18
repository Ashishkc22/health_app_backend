const cardSch = require("../models/card");
const moment = require("moment");
// const statusMapper = {
//     SUBMITTED: ["REPRINT", "SUBMITTED"],
//     OTHER: ["UNDELIVERED", "DELIVERED"],
//     REPRINT: ["REPRINT"],
//     UNDELIVERED: ["UNDELIVERED"],
//     DISCARDED: ["DISCARDED"],
//     RECEIVED: ["RECEIVED"],
//   };
async function getCardsCount({ _id } = {}) {
  try {
    const submitted = await cardSch.countDocuments({
      $or: [{ status: "SUBMITTED" }, { status: "PRINTED" }],
      created_by: _id,
    });
    const delivered = await cardSch.countDocuments({
      status: "DELIVERED",
      created_by: _id,
    });
    const others = await cardSch.countDocuments({
      status: {
        $in: ["UNDELIVERED", "DICARDED"],
      },
      created_by: _id,
    });
    const received = await cardSch.countDocuments({
      status: "RECEIVED",
      created_by: _id,
    });
    const discarded = await cardSch.countDocuments({
      status: "DISCARDED",
      created_by: _id,
    });
    const total = await cardSch.countDocuments({
      created_by: _id,
    });
    return {
      submitted,
      delivered,
      discarded,
      others,
      total,
      received,
    };
  } catch (error) {
    console.error("Get cards Count processord Failed", error.message);
    throw error;
  }
}

module.exports = getCardsCount;
