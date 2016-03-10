class IgnoreHelper {
    constructor(client, ignoredRepository, ignoredManager, logger) {
        this.client            = client;
        this.ignoredRepository = ignoredRepository;
        this.ignoredManager    = ignoredManager;
        this.logger            = logger;
    }

    toggleIgnore(type, id) {
        return new Promise((resolve, reject) => {
            this.getIgnores(ignored => {
                let index = ignored.findIndex(item => item.type === type && item.identifier === id);
                console.log("Ignored Index: " + index);
                if (index === -1) {
                    this.ignoredManager.create({type: type, identifier: id, ignored: true})
                        .then(resolve)
                        .catch(reject);
                } else {
                    ignored[index].ignored = !ignored[index].ignored;
                    this.ignoredManager.update(ignored[index])
                        .then(resolve)
                        .catch(reject);
                }
            });
        });
    }

    ignore(type, id) {
        return new Promise((resolve, reject) => {
            this.getIgnores(ignored => {
                let index = ignored.findIndex(item => item.type === type && item.id === id);
                if (index === -1) {
                    this.ignoredManager.create({type: type, id: id, ignored: true})
                        .then(resolve)
                        .catch(reject);
                } else {
                    ignored[index].ignored = true;
                    this.ignoredManager.update(ignored[index])
                        .then(resolve)
                        .catch(reject);
                }
            });
        });
    }

    batchIgnore(type, ids, callback) {
        this.getIgnores(ignored => {
            for (let i in ids) {
                if (!ids.hasOwnProperty(i)) {
                    continue;
                }

                let id = ids[i];
                this.ignore(type, id).then(callback).catch(this.logger.error);
            }
        });
    }

    unignore(type, id) {
        return new Promise((resolve, reject) => {
            this.getIgnores(ignored => {
                let index = ignored.findIndex(item => item.type === type && item.id === id);
                if (index === -1) {
                    this.ignoredManager.create({type: type, id: id, ignored: false})
                        .then(resolve)
                        .catch(reject);
                } else {
                    ignored[index].ignored = false;
                    this.ignoredManager.update(ignored[index])
                        .then(resolve)
                        .catch(reject);
                }
            });
        });
    }

    getIgnores(callback) {
        this.ignoredRepository.find()
            .then(ignored => {
                callback(ignored);
            }).catch(this.logger.error);
    }

    reset() {
        this.getIgnores(ignored => {
            this.ignoredManager.delete(ignored);
        });
    }

    isNotIgnored(message) {
        return new Promise(resolve => {
            if (message.author.id === this.client.admin.id) {
                return resolve();
            }

            let isIgnored = false;
            this.getIgnores(ignored => {
                ignored.forEach(item => {
                    if (isIgnored || !item.ignored) {
                        return;
                    }

                    if (item.type === 'server' && item.id == message.server.id) {
                        isIgnored = true;
                    }

                    if (item.type === 'channel') {
                        let split  = item.id.split('-'),
                            server = message.channel.server;

                        if (!server) {
                            return;
                        }

                        if (split[0] == server.id && split[1] == message.channel.id) {
                            isIgnored = true;
                        }
                    }

                    if (item.type === 'user' && item.id == message.author.id) {
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