const winston = require('winston');

module.exports = function(debug, log_dir, name) {
    var logger = new (winston.Logger)({
        transports: [
            new (winston.transports.File)({
                file:      `${log_dir}/${name}.log`,
                colorize:  false,
                timestamp: true,
                json:      true
            }),
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
