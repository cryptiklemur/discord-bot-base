const Message = require('../Model/Message');

class MessageManager {
    constructor(client, prefix) {
        this.client = client;
        this.prefix = prefix;
    }

    create(message) {
        return new Message(this.client, this.prefix, message);
    }
}

module.exports = MessageManager;