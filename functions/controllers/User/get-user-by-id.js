const { getUser } = require("../../processors");

const getUserById = async (req, res, next) => {
  try {
    const user = await getUser({
      ...(req.query.id && { id: req.query.id }),
      ...(req.query.uid && { uid: req.query.uid }),
      ...(req.query.tlId && { tlID: req.query.tlId }),
      projection: { password: 0, services: 0 },
    });
    return res.status(200).json({
      status: "success",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = getUserById;
