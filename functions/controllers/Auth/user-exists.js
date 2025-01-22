
const { getUser } = require("../../processors");
const { isEmpty } = require("lodash");
const { CustomError } = require("../../utils/custom-errors");
const { ErrorEnums } = require("../../Enums");

async function userExists(req, res, next) {
    try {
        const user = await getUser({ email: req.query.email });
        if (isEmpty(user)) {
            throw new CustomError(ErrorEnums.USER_NOT_FOUND);
        }
        return res.status(200).json({
            status: "success"
        });
    } catch (error) {
        next(error);
    }
}

module.exports = userExists ;