const AbstractCommand = require('../../../AbstractCommand'),
      Module          = require('../../../Model/Mongo/Module');

class ModuleCommand extends AbstractCommand {
    static get name() {
        return 'module';
    }

    static get description() {
        return "Toggles modules for servers";
    }

    static get help() {
        return `Run this in a server, with the name of a module to enable or disable a module.

Example:

\`module enable test\`
\`module disable test\``
    };

    static get adminCommand() {
        return true;
    }

    handle() {
        if (!this.isAdminOrOwner()) {
            return false;
        }

        this.responds(/^module$/, () => {
            return this.reply(ModuleCommand.help);
        });

        this.responds(/^module (disable|enable) ([A-Za-z0-9-_\s]+)$/, (matches) => {
            if (!this.isAdminOrOwner() || this.isPm()) {
                return false;
            }

            if (matches[2] === 'core') {
                return this.reply("The core module is not toggleable.");
            }

            Server.findOne({identifier: this.server.id}, (error, server) => {
                if (error) {
                    this.reply("There was an error toggling that module. Try again later.");

                    return this.logger.error(error);
                }

                if (!server) {
                    return this.container.get('module.model.server').createFromClientServer(this.server)
                        .then(server => {
                            this.toggleModule(server, matches[2], matches[1] === 'enable');
                        })
                        .catch(this.logger.error)
                }

                this.toggleModule(server, matches[2], matches[1] === 'eable');
            });
        });
    }

    toggleModule(server, moduleName, enabled) {
        let serverModule = server.findModule(moduleName);
        if (!serverModule) {
            let module = this.container.get('manager.module').getModule(moduleName);
            server.modules.push({name: module.name, enabled: enabled});

            return this.toggleModule(server, moduleName, enabled);
        }

        this.container.get('module.model.server').update(server)
            .then(server => {
                this.reply("Module is now enabled on " + server.name, 0, 3000);
                this.client.deleteMessage(this.message.message, {wait: 3000}).catch(this.logger.error);
            })
            .catch(error => {
                this.reply("There was an error toggling that module. Try again later.");

                return this.logger.error(error);
            })
    }
}

module.exports = ModuleCommand;