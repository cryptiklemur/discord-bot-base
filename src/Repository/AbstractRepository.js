class AbstractRepository {
    get model() {
        return this.constructor.name.replace('Repository', '');
    }

    constructor(storage) {
        if (this.constructor === AbstractRepository) {
            throw new Error("Can't instantiate abstract class!");
        }

        this.storage    = storage;
        this.mongoModel = require('../Model/Mongo/' + this.model);
        this.mysqlModel = require('../Model/Mysql/' + this.model);
    }

    find(identifiers) {
        identifiers = identifiers === undefined ? {} : identifiers;

        return new Promise((resolve, reject) => {
            if (this.storage === 'mongo') {
                return this.mongoModel.find(identifiers, (error, items) => {
                    if (error) {
                        return reject(error);
                    }

                    resolve(items);
                })
            }

            if (this.storage === 'mysql') {
                return this.mysqlModel.find(identifiers, (error, items) => {
                    if (error) {
                        return reject(error);
                    }

                    resolve(items);
                });
            }
        });
    }

    findOne(identifiers) {
        identifiers = identifiers === undefined ? {} : identifiers;

        return new Promise((resolve, reject) => {
            if (this.storage === 'mongo') {
                return this.mongoModel.findOne(identifiers, (error, item) => {
                    if (error) {
                        return reject(error);
                    }

                    resolve(item);
                    error ? reject(item) : resolve(error)
                })
            }

            if (this.storage === 'mysql') {
                return this.mysqlModel.find(identifiers, (error, items) => {
                    if (error) {
                        return reject(error);
                    }

                    resolve(items.length > 0 ? items[0] : null);
                });
            }
        });
    }
}

module.exports = AbstractRepository;