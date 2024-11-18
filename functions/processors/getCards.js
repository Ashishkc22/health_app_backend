const cardSch = require("../models/card");
const moment = require("moment");

async function getCards({
  skip,
  limit = 40,
  from,
  to,
  duration,
  search,
  status = [],
  options = {},
  sort = { created_at: -1, tehsil: 1, created_by: 1 },
} = {}) {
  try {
    return await cardSch
      .find({
        ...(status.length && { status: { $in: status } }),
        ...(search && {
          $or: [
            { unique_number: search },
            { name: { $regex: search, $options: "i" } },
            { phone: search },
          ],
        }),
        ...(from && { created_at: { $gte: from, ...(to && { $lte: to }) } }),
        ...(duration && {
          created_at: { $gte: moment().startOf(duration).valueOf() },
        }),
        ...options,
      })
      .sort(sort)
      .skip(skip)
      .limit(limit);
  } catch (error) {
    console.error("Get cards processord Failed", error.message);
    throw error;
  }
}

module.exports = getCards;
