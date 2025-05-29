const { getUser } = require("../../processors");

const getMyDetails = async (req, res, next) => {
  try {
    const user = await getUser({
      id: req.userDetails.id,
      projection: { password: 0, services: 0 },
    });
    if (user && (user.team_leader_id || "") != "") {
      const tl = await getUser({ tlID: user.team_leader_id });
      if (tl != null) {
        user.team_leader_name = tl.name;
      }
    }
    return res.status(200).json({
      status: "success",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = getMyDetails;
