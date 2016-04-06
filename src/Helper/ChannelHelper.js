class ChannelHelper {
    constructor(client) {
        this.client = client;
    }

    getChannelLogs(channel, limit, messages) {
        limit = limit === undefined ? 'all' : limit;

        return new Promise((resolve, reject) => {
            if (limit < 100) {
                return this.client.getChannelLogs(channel, limit)
                    .catch(reject)
                    .then(resolve);
            }

            messages = messages === undefined ? [] : messages;
            this.client.getChannelLogs(channel, 100, {before: messages[messages.length - 1]})
                .catch(reject)
                .then(logs => {
                    messages = messages.concat(logs);
                    if (limit !== 'all' && messages.length > limit) {
                        messages.splice(limit);

                        return resolve(messages);
                    }

                    if (logs.length < 100) {
                        return resolve(messages);
                    }

                    this.getChannelLogs(channel, limit, messages).then(resolve).catch(reject);
                })
        });
    }
}

module.exports = ChannelHelper;