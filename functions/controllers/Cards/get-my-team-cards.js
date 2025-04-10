const { DBEnums } = require("../../Enums");
const { cardSchema, userSchema } = require("../../models");
const { isEmpty } = require("lodash");

const getMyTeamCards = async (req, res, next) => {
  try {
    const { tl_id } = req.userDetails;
    const { status } = req.query;
    let users = await userSchema.find(
      { team_leader_id: tl_id },
      { uid: 1, _id: 0 }
    );
    if (isEmpty(users)) {
      throw new CustomError(ErrorEnums.NO_FE_FOUND);
    }
    users = users.map((us) => us.uid);

    const cards = await cardSchema.find({
      status: status || DBEnums.CARD_STATUS.SUBMITTED,
      created_by_uid: { $in: users },
    });
    res.status(200).json({
      status: "success",
      data: cards,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = getMyTeamCards;
