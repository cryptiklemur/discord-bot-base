const winston = require('winston');

module.exports = function (debug, log_dir, name) {
    var transports = [
        new (winston.transports.Console)({
            prettyPrint:      true,
            colorize:         true,
            silent:           false,
            timestamp:        true,
            handleExceptions: true
        })
    ];

    if (log_dir !== null) {
        transports.push(new (winston.transports.File)({
            filename:  `${log_dir}/${name}.log`,
            colorize:  false,
            timestamp: true,
            json:      true
        }));
    }


    var logger = new (winston.Logger)({transports: transports});
    logger.cli();

    return logger;
};
