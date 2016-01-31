const winston = require('winston');

module.exports = function(env) {
    var logger = new (winston.Logger)({
        transports: [
            new (winston.transports.Console)({
                prettyPrint:      true,
                colorize:         true,
                silent:           false,
                timestamp:        env === 'dev',
                handleExceptions: true
            })
        ]
    });
    logger.cli();

    return logger;
};