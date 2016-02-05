const winston = require('winston');
const Rotate  = require('winston-logrotate').Rotate;

module.exports = function(debug, log_dir, name) {
    var logger = new (winston.Logger)({
        transports: [
            new (Rotate)({
                file:      `${log_dir}/${name}.log`,
                colorize:  true,
                timestamp: true,
                json:      true,
                max:       '100m',
                keep:      7,
                compress:  true
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