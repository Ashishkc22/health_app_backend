const bcrypt = require("bcrypt");
const saltRounds = 10;

function hashPassword({ text = "" }) {
  try {
    return bcrypt.hashSync(text, bcrypt.genSaltSync(saltRounds));
  } catch (error) {
    throw error;
  }
}

function comparePassword({ text = "", hashPassword }) {
  try {
    return bcrypt.compareSync(text, hashPassword);
  } catch (error) {
    throw error;
  }
}

module.exports = { hashPassword, comparePassword };
