const amqp = require('amqp');

module.exports = function (config) {
    if (config == {}) {
        return null;
    }

    return amqp.createConnection(config);
};
