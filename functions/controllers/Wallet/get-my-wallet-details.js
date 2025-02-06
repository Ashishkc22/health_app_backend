const { getWalletDetails } = require("../../processors");
const { DBEnums, CustomError, ErrorEnums } = require("../../Enums");

const getMyWalletDetails = async (req, res, next) => {
  try {
    const userId = req.userDetails.id;
    const wallet = await getWalletDetails({ userId, status: DBEnums.WALLET_STATUS.ACTIVE });
    if (!wallet) {
      throw new CustomError(ErrorEnums.WALLET_DOES_NOT_EXIST);
    }
    return res.status(200).json({
      status: "success",
      data: wallet,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = getMyWalletDetails;
