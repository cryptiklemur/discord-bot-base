class IgnoreHelper {
    constructor(client, ignoredRepository, ignoredManager, logger) {
        this.client            = client;
        this.ignoredRepository = ignoredRepository;
        this.ignoredManager    = ignoredManager;
        this.logger            = logger;
    }

    toggleIgnore(type, id) {
        return new Promise((resolve, reject) => {
            this.ignoredRepository.findOne({type: type, identifier: id})
                .then(ignored => {
                    if (!ignored) {
                        return this.ignoredManager.create({type: type, identifier: id, ignored: true})
                            .then(resolve)
                            .catch(reject);
                    }

                    ignored.ignored = !ignored.ignored;
                    this.ignoredManager.update(ignored)
                        .then(resolve)
                        .catch(reject);
                });
        });
    }

    ignore(type, id) {
        return new Promise((resolve, reject) => {
            this.ignoredRepository.findOne({type: type, identifier: id})
                .catch(this.logger.error)
                .then(ignored => {
                    if (!ignored) {
                        return this.ignoredManager.create({type: type, identifier: id, ignored: true})
                            .then(resolve)
                            .catch(reject);
                    }

                    ignored.ignored = true;
                    this.ignoredManager.update(ignored)
                        .then(resolve)
                        .catch(reject);
                });
        });
    }

    unignore(type, id) {
        return new Promise((resolve, reject) => {
            this.ignoredRepository.findOne({type: type, identifier: id})
                .catch(this.logger.error)
                .then(ignored => {
                    if (!ignored) {
                        return this.ignoredManager.create({type: type, identifier: id, ignored: false})
                            .then(resolve)
                            .catch(reject);
                    }

                    ignored.ignored = false;
                    this.ignoredManager.update(ignored)
                        .then(resolve)
                        .catch(reject);
                });
        });
    }

    batchIgnore(type, ids, callback) {
        for (let i in ids) {
            if (!ids.hasOwnProperty(i)) {
                continue;
            }

            let id = ids[i];
            this.ignore(type, id).then(callback).catch(this.logger.error);
        }
    }

    getIgnores(callback) {
        this.ignoredRepository.find().catch(this.logger.error).then(ignored => callback);
    }

    reset() {
        this.ignoredRepository.find().catch(this.logger.error).then(ignored => ignored.forEach(this.ignoredManager.delete))
    }

    isNotIgnored(message) {
        return new Promise(resolve => {
            if (message.author.id === this.client.admin.id) {
                return resolve();
            }

            let isIgnored = false;
            this.ignoredRepository.find()
                .catch(this.logger.error)
                .then(ignored => {
                    ignored.forEach(item => {
                        if (isIgnored || !item.ignored) {
                            return;
                        }

                        if (item.type === 'server' && message.channel.server && item.identifier == message.channel.server.id) {
                            isIgnored = true;
                        }

                        if (item.type === 'channel') {
                            let split  = item.identifier.split('-'),
                                server = message.channel.server;

                            if (!server) {
                                return;
                            }

                            if (split[0] == server.id && split[1] == message.channel.id) {
                                isIgnored = true;
                            }
                        }

                        if (item.type === 'user' && item.identifier == message.author.id) {
                            isIgnored = true;
                        }
                    });

                    if (!isIgnored) {
                        resolve();
                    }
                });
        });
    }
}

module.exports = IgnoreHelper;