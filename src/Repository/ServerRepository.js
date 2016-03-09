const AbstractRepository = require('./AbstractRepository');

class ServerRepository extends AbstractRepository {
    constructor(storage, brain) {
        super(storage);
        this.brain = brain;
    }

    findByIdentifier(identifier) {
        return new Promise((resolve, reject) => {
            this.brain.get('repository.server.identifier.' + identifier, (err, result) => {
                if (err) {
                    return reject(err);
                }

                if (!result) {
                    return this.findOne({identifier: identifier}).then(resolve).catch(reject);
                }

                return resolve(result);
            });
        });
    }
}

module.exports = ServerRepository;