const winston = require('winston');

module.exports = function(debug) {
    var logger = new (winston.Logger)({
        transports: [
            new (winston.transports.Console)({
                prettyPrint:      true,
                colorize:         true,
                silent:           false,
                timestamp:        debug,
                handleExceptions: true
            })
        ]
    });
    logger.cli();

    return logger;
};