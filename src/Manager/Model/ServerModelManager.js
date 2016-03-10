const MongoServer = require('../../Model/Mongo/Server'),
      MysqlServer = require('../../Model/Mysql/Server'),
      MysqlModule = require('../../Model/Mysql/Module');

class ServerModelManager {
    constructor(storage, moduleManager, prefix) {
        this.storage       = storage;
        this.moduleManager = moduleManager;
        this.prefix        = prefix;
    }

    create(properties) {
        if (!properties.prefix) {
            properties.prefix = this.prefix;
        }

        let modules = this.moduleManager.getModules();

        return new Promise((resolve, reject) => {
            if (this.storage === 'mongo') {
                let server = new MongoServer(properties);

                for (let index in modules) {
                    if (!modules.hasOwnProperty(index)) {
                        continue;
                    }

                    let module = modules[index];
                    server.modules.push({name: module.name, enabled: module.isDefaultEnabled()});
                }

                return server.save(error => {
                    if (error) {
                        return reject(error);
                    }

                    server.save(error => {
                        if (error) {
                            return reject(error);
                        }

                        return resolve(server);
                    });
                })
            }

            if (this.storage === 'mysql') {
                MysqlServer.create(properties, (error, servers) => {
                    if (error) {
                        return reject(error);
                    }

                    let server = Array.isArray(servers) ? servers[0] : servers;

                    for (let index in modules) {
                        if (!modules.hasOwnProperty(index)) {
                            continue;
                        }

                        let module = modules[index];
                        server.modules.push(new MysqlModule({
                            name: module.name, enabled: module.isDefaultEnabled()
                        }));
                    }

                    server.save(error => {
                        if (error) {
                            return reject(error);
                        }

                        resolve(server);
                    });
                })
            }
        });
    }

    createFromClientServer(server) {
        return this.create({
            identifier: server.id,
            owner:      server.owner.id,
            prefix:     this.prefix
        });
    }

    update(server) {
        return new Promise((resolve, reject) => {
            server.save(error => {
                if (error) {
                    return reject(error);
                }

                resolve(server);
            })
        })
    }
}

module.exports = ServerModelManager;
