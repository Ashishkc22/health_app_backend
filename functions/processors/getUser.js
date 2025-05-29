const { userSchema } = require("../models");
const { CustomError } = require("../utils/custom-errors");
const { logger } = require("../utils/logger");
const { ProcessorErrors } = require("../Enums");
const { isEmpty } = require("lodash");
const mongoose = require("mongoose");

const getUser = async ({
  id = "",
  email = "",
  phone = "",
  tlID = "",
  teamLeaderID = "",
  uid = "",
  searchOptions = {},
  projection = {},
}) => {
  try {
    if (!id && !email && !phone && !tlID && !uid && isEmpty(searchOptions))
      throw new CustomError(ProcessorErrors.USERS.GET_USER_ERROR);

    return await userSchema
      .findOne(
        {
          ...(id && { _id: mongoose.Types.ObjectId(id) }),
          ...(email && { email }),
          ...(phone && { phone }),
          ...(tlID && { tl_id: tlID }),
          ...(teamLeaderID && { team_leader_id: teamLeaderID }),
          ...(uid && { uid }),
          ...searchOptions,
        },
        projection
      )
      .then(async (item) => {
        if (isEmpty(item)) {
          return item;
        }
        if (mongoose.Types.ObjectId.isValid(item.current_district)) {
          await item.populate("current_district");
        } else {
          item.current_district = {
            _id: "",
            name: item.current_district || "",
          };
        }

        if (mongoose.Types.ObjectId.isValid(item.current_janpad)) {
          await item.populate("current_janpad");
        } else {
          item.current_janpad = {
            _id: "",
            name: item.current_janpad || "",
          };
        }

        if (mongoose.Types.ObjectId.isValid(item.current_gram_panchayat)) {
          await item.populate("current_gram_panchayat");
        } else {
          item.current_gram_panchayat = {
            _id: "",
            name: item.current_gram_panchayat || "",
          };
        }

        if (mongoose.Types.ObjectId.isValid(item.current_gram)) {
          await item.populate("current_gram");
        } else {
          item.current_gram = {
            _id: "",
            name: item.current_gram || "",
          };
        }

        if (mongoose.Types.ObjectId.isValid(item.current_tehsil)) {
          await item.populate("current_tehsil");
        } else {
          item.current_tehsil = {
            _id: "",
            name: item.current_tehsil || "",
          };
        }
        return item;
      });
  } catch (error) {
    logger.error(`Failed to get user by id [Processor]`);
    throw error;
  }
};

module.exports = getUser;
