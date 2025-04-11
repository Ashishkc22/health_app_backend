const { DBEnums } = require("../../Enums");
const { cardSchema, userSchema } = require("../../models");
const { isEmpty } = require("lodash");

const getMyTeamCards = async (req, res, next) => {
  try {
    const { tl_id } = req.userDetails;
    const { status, page = 1, limit = 20, listMode = "true" } = req.query;

    let users = await userSchema.find(
      { team_leader_id: tl_id },
      { uid: 1, _id: 0, image: 1 }
    );

    if (isEmpty(users)) {
      throw new CustomError(ErrorEnums.NO_FE_FOUND);
    }

    users = users.map((us) => us.uid);

    const query = {
      created_by_uid: { $in: users },
      ...(status && { status }),
    };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    let [cards, total] = await Promise.all([
      cardSchema
        .find(query)
        .skip(skip)
        .limit(parseInt(limit))
        .populate({
          path: "created_by",
          model: "User",
          select: "image _id name",
        }),
      cardSchema.countDocuments(query),
    ]);

    if (listMode === "false") {
      // Grouping the data by date
      cards = cards.reduce((result, doc) => {
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
        result[str].data.push(doc);
        return result;
      }, {});
    }
    res.status(200).json({
      status: "success",
      data: Object.values(cards),
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

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

module.exports = getMyTeamCards;
