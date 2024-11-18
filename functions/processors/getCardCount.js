const cardSch = require("../models/card");
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
    const others = await cardSch.countDocuments({
      status: {
        $in: ["UNDELIVERED", "DELIVERED"],
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
      discarded,
      received,
      others,
      total,
    };
  } catch (error) {
    console.error("Get cards Count processord Failed", error.message);
    throw error;
  }
}

module.exports = getCardsCount;
