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

            this.saveIgnores(ignored, callback(ignored[index]));
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
}

module.exports = IgnoreHelper;