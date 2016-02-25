class IgnoreHelper {
    constructor(keyPrefix, brain, logger) {
        this.keyPrefix = keyPrefix;
        this.brain     = brain;
        this.logger    = logger;
    }

    toggleIgnore(type, id, callback) {
        if (!this.brain.get) {
            this.logger.error("Brain isn't initialized");
            throw new Error("Brain isn't initialized");
        }

        this.getIgnores(ignored => {
            let index = ignored.findIndex(item => item.type === type && item.id === id);
            if (index === -1) {
                ignored.push({type: type, id: id, ignored: true});
                index = ignored.length - 1;
            } else {
                ignored[index].ignored = !ignored[index].ignored;
            }

            this.saveIgnores(ignored, callback.call(ignored[index]));
        });
    }

    ignore(type, id, callback) {
        if (!this.brain.get) {
            this.logger.error("Brain isn't initialized");
            throw new Error("Brain isn't initialized");
        }

        this.getIgnores(ignored => {
            let index = ignored.findIndex(item => item.type === type && item.id === id);
            if (index === -1) {
                ignored.push({type: type, id: id, ignored: true});
                index = ignored.length - 1;
            } else {
                ignored[index].ignored = true;
            }

            this.saveIgnores(ignored, callback.call(ignored[index]));
        });
    }

    batchIgnore(type, ids, callback) {

        if (!this.brain.get) {
            this.logger.error("Brain isn't initialized");
            throw new Error("Brain isn't initialized");
        }

        this.getIgnores(ignored => {
            for (let i in ids) {
                if (!ids.hasOwnProperty(i)) {
                    continue;
                }

                let id = ids[i];

                let index = ignored.findIndex(item => item.type === type && item.id === id);
                if (index === -1) {
                    ignored.push({type: type, id: id, ignored: true});
                    index = ignored.length - 1;
                } else {
                    ignored[index].ignored = true;
                }
            }

            this.saveIgnores(ignored, callback.call(ignored));
        });
    }

    unignore(type, id, callback) {
        if (!this.brain.get) {
            this.logger.error("Brain isn't initialized");
            throw new Error("Brain isn't initialized");
        }

        this.getIgnores(ignored => {
            let index = ignored.findIndex(item => item.type === type && item.id === id);
            if (index === -1) {
                ignored.push({type: type, id: id, ignored: false});
                index = ignored.length - 1;
            } else {
                ignored[index].ignored = false;
            }

            this.saveIgnores(ignored, callback.call(ignored[index]));
        });
    }

    getIgnores(callback) {
        this.brain.get(this.keyPrefix + '.ignore', (err, results) => {
            if (err) { return this.logger.error(err); }
            let ignored = results === null ? [] : JSON.parse(results);

            return callback(ignored);
        });
    }

    saveIgnores(ignored, callback) {
        this.brain.set(this.keyPrefix + '.ignore', JSON.stringify(ignored), callback);
    }

    reset() {
        this.saveIgnores([]);
    }

    isNotIgnored(message, callback) {
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
                    let split = item.id.split('-');
                    if (split[0] == message.server.id && split[1] == message.channel.id) {
                        isIgnored = true;
                    }
                }

                if (item.type === 'user' && item.id == message.author.id) {
                    isIgnored = true;
                }
            });

            if (!isIgnored) {
                callback();
            }
        });
    }
}

module.exports = IgnoreHelper;