const MongoIgnored = require('../../Model/Mongo/Ignored'),
      MysqlIgnored = require('../../Model/Mongo/Ignored');

class IgnoredModelManager {
    constructor(storage, repository) {
        this.storage    = storage;
        this.repository = repository;
    }

    create(properties) {
        return new Promise((resolve, reject) => {
            if (this.storage === 'mongo') {
                let ignore = new MongoIgnored(properties);

                return ignore.save(error => {
                    if (error) {
                        return reject(error);
                    }

                    return resolve(ignore);
                });
            }

            if (this.storage === 'mysql') {
                MysqlIgnored.create(properties, (error, ignores) => {
                    if (error) {
                        return reject(error);
                    }

                    return resolve(Array.isArray(ignores) ? ignores[0] : ignores)
                })
            }
        });
    }

    update(ignored) {
        return new Promise((resolve, reject) => {
            ignored.save(error => {
                if (error) {
                    return reject(error);
                }

                resolve(ignored);
            })
        })
    }

    remove(ignored) {
        return new Promise((resolve, reject) => {
            ignored.remove(error => {
                if (error) {
                    return reject(error);
                }

                resolve();
            })
        })
    }
}

module.exports = IgnoredModelManager;
