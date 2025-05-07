const { getAddressByType } = require("../../processors");
const { DBEnums } = require("../../Enums");

const getAddessByType = async (req, res, next) => {
  try {
    const query = {
      ref_id: req.query.refId,
      active: !(req.query.showHidden || false),
    };
    const isUserAdmin = req.userDetails.role === DBEnums.USER_ROLES.ADMIN;

    const data = await getAddressByType({
      query,
      type: req.query.type,
      showGrams: !isUserAdmin,
      gramWithTeshilId: req.query?.isTeshilId || false,
      showCardCount: req.query.showCardCount || false,
    });
    return res.status(200).json({
      status: "success",
      data,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = getAddessByType;
