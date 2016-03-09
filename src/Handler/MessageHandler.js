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
        if (Object.keys(this.queue).length === 0 || process.env.NODE_APP_INSTANCE === undefined) {
            this.logger.info('Message Handler: Starting basic message handler.');
            this.client.on('message', this.listener.handleMessage.bind(this.listener));

            return callback();
        }

        this.queue.on('error', error => {
            this.logger.error('Message Handler: Failed to initialize queue connection', error);
            process.exit(1);
        });

        this.logger.info("Message Handler: Using Rabbit for messages. Waiting for queue connection.");
        this.queue.connect();

        this.queue.on('ready', () => {
            this.logger.info("Message Handler: Queue connection ready. Creating subscriber");
            this.createSubscriber(callback);

            if (process.env.NODE_APP_INSTANCE <= 1) {
                this.logger.info("Message Handler: First node in cluster, creating publisher");
                this.client.on('message', message => {
                    let messageId = this.messages.push(message) - 1;
                    this.queue.publish(this.name, messageId);
                });
            }
        });
    }

    createSubscriber(callback) {
        this.queue.queue(this.name, (q) => {
            this.logger.debug(`Message Handler: Queue **${this.name}** is open`);
            // Catch all messages
            q.bind('#');

            // Receive messages
            q.subscribe(messageId => {
                let message = this.messages[messageId];

                delete this.messages[messageId];

                this.listener.handleMessage(message);
            });

            this.logger.info("Message Handler: Subscriber created. Running callback");
            return callback();
        });
    }
}

module.exports = MessageHandler;