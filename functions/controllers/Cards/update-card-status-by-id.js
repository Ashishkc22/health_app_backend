const { isEmpty } = require("lodash");
const { updateCardStatus, getCardById } = require("../../processors");
const { CustomError } = require("../../utils/custom-errors");
const { ErrorEnums, CardEnums, DBEnums } = require("../../Enums");

async function updateCardStatusById(req, res, next) {
  try {
    const { role } = req.userDetails;
    if (
      role !== DBEnums.USER_ROLES.TL &&
      req.body.status === DBEnums.CARD_STATUS.SUBMITTED &&
      CardEnums.ROLES_ALLOWED_TO_UPDATE_STATUS[role].includes(
        req.body.status.toString().toUpperCase()
      )
    ) {
      throw new CustomError(ErrorEnums.NOT_ALLOWED_TO_CHANGE_STATUS);
    }
    const cardDetails = await getCardById({
      id: req.body.id,
      project: { status: 1 },
    });
    if (isEmpty(cardDetails)) {
      throw new CustomError(ErrorEnums.CARD_NOT_FOUND);
    }
    if (
      req.body?.status &&
      Object.values(DBEnums.CARD_STATUS).includes(
        req.body.status.toString().toUpperCase()
      ) &&
      !CardEnums.STATUS_FLOW_MAPPER[cardDetails.status].includes(
        req.body.status.toString().toUpperCase()
      )
    ) {
      throw new CustomError(ErrorEnums.CARD_STATUS_CAN_NOT_BE_UPDATED);
    }

    return res.status(200).json({
      status: "success",
      data: await updateCardStatus({
        id: req.body.id,
        status: req.body.status.toString().toUpperCase(),
        userDetails: req.userDetails,
      }),
    });
  } catch (error) {
    next(error);
  }
}

module.exports = updateCardStatusById;
