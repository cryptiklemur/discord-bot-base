const amqp = require('amqp');

module.exports = function (config) {
    if (Object.keys(config).length) {
        return null;
    }

    return amqp.createConnection(config);
};
