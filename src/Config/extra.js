const RabbitQueue = require('../Queue/RabbitQueue');

module.exports = {
    "queue.rabbit": {module: RabbitQueue, args: ['%queue%']}
};
