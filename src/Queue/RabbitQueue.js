const amqp = require('amqp');

module.exports = function (config) {
    if (Object.keys(config).length === 0) {
        return null;
    }

    return amqp.createConnection(config);
};
