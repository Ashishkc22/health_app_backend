const winston = require("winston");
const { combine, timestamp, printf, align, colorize } = winston.format;

const levels = {
  emerg: 0,
  alert: 1,
  crit: 2,
  error: 3,
  warning: 4,
  notice: 5,
  info: 6,
  debug: 7,
};

module.exports = winston.createLogger({
  levels: levels,
  level: process.env.LOGGER_LEVEL || "info",
  format: combine(
    colorize({ all: true }),
    timestamp({ format: "DD-MM-YYYY hh:mm:ss.SSS A" }),
    align(),
    printf((info) => `[${info.timestamp}] ${info.level}:  ${info.message}`)
  ),
  transports: [new winston.transports.Console()],
});
