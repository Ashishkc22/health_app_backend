module.exports = {
  USERS: {
    GET_USER_ERROR: {
      name: "GET_USER_BY_ID_ERROR",
      httpCode: 501,
      description: "Failed to get user by id.",
    },
  },
  RESET_PASSWORD: {
    MISSING_EMAIL: {
      name: "MISSING_EMAIL",
      httpCode: 502,
      description: "Failed to get user email.",
    },
  },
  INVALID_ADDRESS_TYPE: {
    name: "INVALID_ADDRESS_TYPE",
    httpCode: 503,
    description: "Got invalid address type.",
  },
};
