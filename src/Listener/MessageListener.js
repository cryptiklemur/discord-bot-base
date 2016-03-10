const prettyjson = require('prettyjson');

class MessageListener {
    constructor(container, logger, moduleManager, serverRepository, serverManager) {
        this.container        = container;
        this.logger           = logger;
        this.moduleManager    = moduleManager;
        this.serverRepository = serverRepository;
        this.serverManager    = serverManager;
    }

    addModules() {
        this.modules = this.moduleManager.getModules();
        if (this.container.hasParameter('nodules')) {
            this.container.getParameter('nodules').forEach(module => {
                this.modules.add(module);
            });
        }

        this.container.get('logger').debug("Added " + this.modules.length + " modules");
    }

    handleMessage(message) {
        let client = this.container.get('client');

        if (message.author.id === client.user.id) {
            return false;
        }

        this.logger.debug("Checking to make sure user is not ignored");
        this.container.get('helper.ignore').isNotIgnored(message)
            .then(this.checkModules.bind(this, message))
            .catch(this.logger.error);
    }

    checkModules(message) {
        // If private message, check against all modules, otherwise, find modules enabled on the given server.
        if (message.channel.server === undefined) {
            this.checkCommands(message, this.moduleManager.getCommandsForServer())
                .catch(this.catchCommandReject);
        } else {
            this.getServer(message)
                .then(server => {
                    this.checkCommands(message, this.moduleManager.getCommandsForServer(server), server)
                        .catch(this.catchCommandReject);
                })
                .catch(this.logger.error);
        }
    }

    catchCommandReject(error) {
    }

    getServer(message) {
        return new Promise((resolve, reject) => {
            this.serverRepository.findByIdentifier(message.channel.server.id)
                .then(server => {
                    if (!server) {
                        return this.serverManager.createFromClientServer(message.channel.server)
                            .then(resolve)
                            .catch(reject);
                    }

                    return resolve(server);
                })
                .catch(this.logger.error);
        });
    }

    checkCommands(message, commands, server) {
        return new Promise((resolve, reject) => {
            for (let index in commands) {
                if (!commands.hasOwnProperty(index)) {
                    continue;
                }

                let cls     = commands[index],
                    command = new cls(this.container, message, server);

                if (typeof command.setCommands === 'function') {
                    command.setCommands(this.commands);
                }

                try {
                    command.handle();
                    resolve();
                } catch (error) {
                    this.logger.error(error.stack);
                    reject(error);
                }
            }
        });
    }
}

module.exports = MessageListener;