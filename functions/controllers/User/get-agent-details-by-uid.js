const { default: mongoose } = require("mongoose");
const { userSchema } = require("../../models");
const { isEmpty } = require("lodash");

const getAgentDetailsByUid = async (req, res, next) => {
  try {
    const { agentUids } = req.query;
    const users = await userSchema.aggregate([
      { $match: { uid: { $in: agentUids } } },
      { $project: { _id: 1, name: 1, uid: 1, team_leader_id: 1 } },
    ]);
    if (isEmpty(users)) {
      return res.status(200).json({ status: "success", data: {} });
    }
    const data = {};
    const tlUIDSet = new Set();
    users.forEach((user) => {
      tlUIDSet.add(user.team_leader_id);
      data[user.uid] = user;
    });
    const tlDetails = {};
    for (let value of tlUIDSet) {
      const tlDetail = await userSchema.findOne(
        { tl_id: value },
        { name: 1, tl_id: 1 }
      );
      if (!isEmpty(tlDetail)) {
        tlDetails[value] = tlDetail;
      }
    }
    return res.status(200).json({
      status: "success",
      data: { FEDetails: data, tlDetails: tlDetails },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = getAgentDetailsByUid;
