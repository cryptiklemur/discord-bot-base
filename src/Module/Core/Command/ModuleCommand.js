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
        if (!this.isOwner() && !this.isAdmin()) {
            return false;
        }

        this.responds(/^module$/, () => {
            return this.reply(ModuleCommand.help);
        });

        this.responds(/^module (disable|enable) ([A-Za-z0-9-_\s]+)$/, (matches) => {
            if (this.isAdmin() || this.isOwner() || this.isPm()) {
                return false;
            }

            if (matches[2] === 'core') {
                return this.reply("The core module is not toggleable.");
            }

            Server.findOne({identifier: this.message.server.id}, (error, server) => {
                if (error || !server) {
                    this.reply("There was an error toggling that module. Try again later.");

                    return this.logger.error(!server ? ('Server doesn\'t exist: ' + this.message.server.id) : error);
                }

                server.findModule(matches[2]).enabled = matches[1] == 'enable';
                server.save(error => {
                    if (error || !server) {
                        this.reply("There was an error toggling that module. Try again later.");

                        return this.logger.error(error);
                    }

                    this.reply("Module is now enabled", 0, 3000);
                    this.client.deleteMessage(this.message.message, {wait: 3000});
                })
            })
        });
    }
}

module.exports = ModuleCommand;