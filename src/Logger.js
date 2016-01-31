const winston = require('winston');

module.exports = function() {
    winston.cli();
    var logger = new (winston.Logger)({transports: [new (winston.transports.Console)()]});
    logger.cli();

    return logger;
};