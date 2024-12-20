const jwt = require("jsonwebtoken");
const { logger } = require("../logger");
const fs = require("fs");
const PRIVATE_KEY = fs.readFileSync("private.key", "utf8");
const PUBLIC_KEY = fs.readFileSync("public.key", "utf8");

async function signToken({
  payload = {},
  expiresIn = "24h",
  algorithm = "RS256",
}) {
  try {
    return await jwt.sign(payload, PRIVATE_KEY, {
      algorithm,
      expiresIn, // Token expires in 1 hour
    });
  } catch (error) {
    logger.crit("Failed to sign jwt token.");
    throw error;
  }
}

async function verifyToken(token) {
  try {
    return await jwt.verify(token, PUBLIC_KEY, { algorithm: "RS256" });
  } catch (error) {
    logger.error("Failed to verify jwt token.");
    throw error;
  }
}

module.exports = {
  signToken,
  verifyToken,
};
