const MessageHandler = require('../Handler/MessageHandler');

module.exports = {
    "handler.message": {
        module: MessageHandler,
        args:   ['@logger', '@client', '@queue.rabbit', '@listener.message', '%name%']
    }
};
