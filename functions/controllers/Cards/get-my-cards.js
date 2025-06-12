const {
  getCards: getCardProcessor,
  getCardCount: getCardCountProcessor,
} = require("../../processors");
const statusMapper = {
  SUBMITTED: ["REPRINT", "SUBMITTED", "PRINTED", "PENDING"],
  OTHER: ["UNDELIVERED", "DELIVERED"],
  REPRINT: ["REPRINT"],
  UNDELIVERED: ["UNDELIVERED"],
  DISCARDED: ["DISCARDED"],
  RECEIVED: ["RECEIVED"],
};

const durationMapper = {
  TODAY: "day",
  "THIS WEEK": "week",
  "THIS MONTH": "month",
};

async function getCards(req, res) {
  try {
    const {
      page,
      limit,
      from,
      to,
      duration,
      search,
      status,
      other,
      responseType,
    } = req.query;

    if (responseType === "COUNT") {
      const cardCounts = await getCardCountProcessor({
        _id: req.userDetails.id,
      });
      return res.status(200).json({
        status: "success",
        ...cardCounts,
      });
    }

    const cardData = await getCardProcessor({
      skip: parseInt(page || 0) * parseInt(limit || "40"),
      ...(limit && { limit: parseInt(limit) }),
      from: parseInt(from),
      to: parseInt(to),
      ...(duration && { duration: durationMapper[duration] }),
      search,
      ...(status && { status: statusMapper[status] }),
      created_by: req.userDetails.id,
      options: other,
    });

    // Grouping the data by date
    const groupedCardData = cardData.reduce((result, card) => {
      const doc = card.toObject();
      const date = new Date(doc.created_at);
      const str = `${weekName(date.getDay())} ${date.getDate()} ${monthName(
        date.getMonth()
      )} ${date.getFullYear()}`;
      if (!result[str]) {
        result[str] = {};
        result[str].date = str;
        result[str].count = 0;
      }
      if (!result[str].data) {
        result[str].data = [];
      }
      result[str].count += 1;
      doc.address = `${doc.area}, ${doc.tehsil}, ${doc.district}, ${doc.state}`;
      delete doc.area;
      delete doc.tehsil;
      delete doc.district;
      delete doc.state;
      delete doc.janpad;
      delete doc.gramPanchayat;
      delete doc.gram;
      result[str].data.push(doc);
      return result;
    }, {});
    res.status(200).json({
      status: "success",
      page_number: req.query.page || "0",
      data: Object.values(groupedCardData),
    });
  } catch (error) {
    console.error("GET Card", error.message);
    res.status(400).json({
      status: "failed",
      message: "Something went wrong while get cards data.",
    });
  }
}

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

module.exports = getCards;
