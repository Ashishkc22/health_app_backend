const { default: mongoose } = require("mongoose");
const { userSchema } = require("../../models");

const getUserStatus = (req, res, next) => {
  try {
    const { id } = req.query;
    const user = userSchema.findOne(
      { _id: mongoose.Types.ObjectId(id) },
      { status: 1 }
    );
    return res.status(200).json({ data: user });
  } catch (error) {
    next(error);
  }
};

module.exports = getUserStatus;
