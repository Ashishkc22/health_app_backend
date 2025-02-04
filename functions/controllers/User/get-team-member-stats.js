const { CustomError } = require("../../utils/custom-errors");
const { isEmpty } = require("lodash");
const { getUser } = require("../../processors");
const { ErrorEnums } = require("../../Enums");

const getTeamMemberStats = async (req, res, next) => {
  try {
    const { tl_id } = req.userDetails;
    const user = await getUser({
      teamLeaderID: tl_id,
      id: req.query.id,
      projection: {
        score: 1,
        p2_count: 1,
        p_count: 1,
        d_count: 1,
        ud_count: 1,
        dis_count: 1,
        RECEIVE_count: 1,
        RTO_count: 1,
        REPRINT_count: 1,
        name: 1,
      },
    });
    if (isEmpty(user)) {
      throw new CustomError(ErrorEnums.USER_NOT_FOUND);
    }
    return res.status(200).json({
      status: "success",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = getTeamMemberStats;
