const path = require('path');
const Winston = require('winston');
require('winston-daily-rotate-file');
const config = require('../config/env')

const { createLogger, format, transports } = Winston;
const LEVEL = Symbol.for('level');
const logPath = path.resolve(__dirname, '../../logs');

const logFormatter = format.printf(
  ({ level, message, timestamp, stack }) =>
    `[ ${timestamp} ] [ ${level.toUpperCase()} ] : ${stack || message} `
);
function filterOnly (level) {
  return format(info => {
    if (info[LEVEL] === level) {
      return info;
    }
    return false;
  })();
}

const transportsConfig = [
  new transports.DailyRotateFile({
    filename: `${logPath}/access-%DATE%.log`,
    datePattern: 'YYYY-MM-DD',
    level: 'http',
    format: filterOnly('http')
  }),
  new transports.DailyRotateFile({
    filename: `${logPath}/application-%DATE%.log`,
    datePattern: 'YYYY-MM-DD',
    level: 'info',
    format: filterOnly('info')
  }),
  new transports.DailyRotateFile({
    filename: `${logPath}/error-%DATE%.log`,
    datePattern: 'YYYY-MM-DD',
    level: 'error'
  })
]

const exceptionHandlers = [
  new transports.DailyRotateFile({
    filename: `${logPath}/exception-%DATE%.log`,
    datePattern: 'YYYY-MM-DD'
  })
]

if (config.NODE_ENV === 'development') {
  transportsConfig.unshift(new transports.Console({ level: 'http' }));
  exceptionHandlers.unshift(new transports.Console({ level: 'http' }));
}

const logger = createLogger({
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss:SSS'
    }),
    logFormatter
  ),
  transports: transportsConfig,
  exceptionHandlers
});

module.exports = {
  logger
};
