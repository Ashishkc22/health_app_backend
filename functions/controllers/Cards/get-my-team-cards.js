const { DBEnums } = require("../../Enums");
const { cardSchema, userSchema } = require("../../models");
const { isEmpty } = require("lodash");

const getMyTeamCards = async (req, res, next) => {
  try {
    const { tl_id } = req.userDetails;
    const { status, page = 1, limit = 10 } = req.query;

    let users = await userSchema.find(
      { team_leader_id: tl_id },
      { uid: 1, _id: 0 }
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

    const [cards, total] = await Promise.all([
      cardSchema.find(query).skip(skip).limit(parseInt(limit)),
      cardSchema.countDocuments(query),
    ]);

    res.status(200).json({
      status: "success",
      data: cards,
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

module.exports = getMyTeamCards;
