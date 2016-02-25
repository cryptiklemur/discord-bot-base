const Message      = require('discord.js').Message;
const _            = require('lodash');

class MessageHandler {
    constructor(logger, client, queue, listener, name) {
        this.logger   = logger;
        this.client   = client;
        this.queue    = queue;
        this.listener = listener;
        this.name     = name;

        this.messages = [];
    }

    run(callback) {
        console.log(Object.keys(this.queue).length === 0, process.env.NODE_APP_INSTANCE);
        if (Object.keys(this.queue).length === 0 || process.env.NODE_APP_INSTANCE === undefined) {
            this.logger.info('Starting basic message handler.');
            this.client.on('message', this.listener.handleMessage.bind(this.listener));

            return callback();
        }

        this.queue.on('error', error => {
            this.logger.error('Failed to initialize queue connection', error);
            process.exit(1);
        });

        this.queue.connect();
        this.logger.info("Using Rabbit for messages. Waiting for queue connection.");

        this.queue.on('ready', () => {
            this.logger.info("Queue connection ready.");
            this.createSubscriber(callback);

            if (process.env.NODE_APP_INSTANCE <= 1) {
                this.client.on('message', message => {
                    this.logger.debug("Message received");
                    let messageId = this.messages.push(message) - 1;

                    this.queue.publish(this.name, messageId, {}, () => {
                        this.logger.debug("Message published");
                    })
                });
            }
        });
    }

    createSubscriber(callback) {
        this.queue.queue(this.name, (q) => {
            this.logger.debug(`Queue **${this.name}** is open`);
            // Catch all messages
            q.bind('#');

            // Receive messages
            q.subscribe(messageId => {
                let message = this.messages[messageId];

                delete this.messages[messageId];

                this.listener.handleMessage(message);
            });

            callback();
        });
    }
}

module.exports = MessageHandler;