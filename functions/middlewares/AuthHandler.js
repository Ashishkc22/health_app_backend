const routes = require("../config.js/router.config");
const { CustomError } = require("../utils/custom-errors");
const { ErrorEnums } = require("../Enums");
const { token } = require("../utils/token");
const { get } = require("../config.js/cache.config");
const { isEmpty } = require("lodash");

// step 1 - Check if request path exists. If path does not exists return failed and error
// step 2 - Check it requested path is public. if public call next()
// step 3 - Validated JWT token. decode JWT token
// step 4 - Check if user hase access to the API

async function authHandler(req, res, next) {
  try {
    const { originalUrl } = req || {};
    const [baseUrl, queryString] = originalUrl.split("?");
    // Check if request path exists. If path does not exists return failed and error
    if (!routes[baseUrl]) {
      throw new CustomError(ErrorEnums.PATH_NOT_FOUND);
    }
    const { isPublic, permissions, services } = routes[baseUrl];
    if (!isPublic) {
      if (!req.headers.authorization) {
        throw new CustomError(ErrorEnums.AUTH_HEADER_MISSING);
      }
      const userDetails = await token.verifyToken(req.headers.authorization);
      // get user permission and service details
      const [userAutdetails] = get(userDetails.id || "") || [];
      // [
      //   {
      //     serviceDetails: {
      //       _id: {},
      //       name: "ADMIN",
      //       description:
      //         "Agents are responsible for assisting customers and managing their requests.",
      //       __v: 0,
      //     },
      //     roleDetails: {
      //       _id: {},
      //       name: "ADMIN",
      //       permissions: [
      //         "ADD_CARDS",
      //         "EDIT_CARDS",
      //         "VIEW_CARDS",
      //         "VIEW_ADDRESS",
      //         "GET_MY_DETAILS",
      //         "VIEW_USERS",
      //         "EDIT_USERS",
      //         "ADD_ADDRESS",
      //         "VIEW_ADDRESS_JANPANCHYAT",
      //         "EDIT_ADDRESS",
      //         "DELETE_CARD",
      //         "DELETE_HOSPITAL",
      //         "VIEW_DELETE_DATA",
      //         "RESTORE_DATA",
      //         "ADD_CARDS",
      //         "UPDATE_CARDS_STATUS_PRINTED",
      //         "UPDATE_CARDS_STATUS",
      //         "VIEW_USER_CARDS",
      //         "VIEW_READY_TO_PRINT_CARDS",
      //         "VIEW_CARD_DETAILS",
      //         "VIEW_CARDS_USER_LIST",
      //         "GET_DASHBOARD_DETAILS",
      //         "ADD_HOSPITALS",
      //         "VIEW_HOSPITALS_DETAILS",
      //         "VIEW_HOSPITALS",
      //         "EDIT_HOSPITALS",
      //         "ADD_SETTINGS",
      //         "GET_SETTINGS",
      //         "USER_DETAILS_BY_ID",
      //         "ADD_TL_USERS",
      //       ],
      //       createdAt: "2024-12-13T16:06:03.873Z",
      //       updatedAt: "2024-12-13T16:06:03.873Z",
      //       __v: 0,
      //     },
      //   },
      // ];

      // if (isEmpty(userAutdetails)) {
      //   throw new CustomError(ErrorEnums.USER_AUTH_DETAILS_NOT_FOUND);
      // }

      // if (
      //   !services.includes(userAutdetails.serviceDetails.name) ||
      //   !permissions.some((value) =>
      //     userAutdetails.roleDetails.permissions.includes(value)
      //   )
      // ) {
      //   throw new CustomError(ErrorEnums.ACCESS_DENIED);
      // }
      req.userDetails = userDetails;
    }
    next();
  } catch (err) {
    let error = err;
    if (error.message === "jwt malformed") {
      error = new CustomError(ErrorEnums.INVALID_TOKEN);
    } else if (error.message === "jwt expired") {
      error = new CustomError(ErrorEnums.INVALID_TOKEN);
    }
    next(error);
  }
}

module.exports = authHandler;
