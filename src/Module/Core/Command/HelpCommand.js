const AbstractCommand = require('../../../AbstractCommand'),
      _               = require('lodash');

class HelpCommand extends AbstractCommand {
    static get name() {
        return 'help';
    }

    static get description() {
        return "Shows the help menu";
    }

    static get help() {
        return "<command> - Shows the help for the given command";
    }

    displayHelp(server) {
        let moduleManager = this.container.get('manager.module'),
            commandList   = moduleManager.getCommandsForServer(server);

        let message = "Hello! Below you will find a list of my modules and their commands.";

        if (!this.isPm()) {
            let prefix = this.prefix;
            if (prefix === '`') {
                prefix = ' `\u200B';
            }

            message += `\nAny of these commands have to be prefix with either \`${prefix}\`, or ${this.client.user.mention()}`;
        }

        this.reply(message)
            .then(() => {
                let modules = moduleManager.getModules();

                for (let index in modules) {
                    if (modules.hasOwnProperty(index)) {
                        setTimeout(() => this.displayModuleHelp(modules[index], server), 50 * index);
                    }
                }
            })
            .catch(this.logger.error);
    }

    displayModuleHelp(module, server) {
        let commandList = [];

        if (!server) {
            commandList = module.getCommands();
        } else {
            let serverModule = server.findModule(module.name);
            if (serverModule && serverModule.enabled) {
                commandList = module.getCommands();
            }
        }

        commandList = _.orderBy(commandList, ['adminCommand', 'module', 'name'], ['asc', 'asc', 'asc']);

        let longestCommand = Math.max(...commandList.map(command => command.name.length));
        longestCommand     = longestCommand > 7 ? longestCommand : 7;

        let commands = commandList.map((command) => {
                if (command.noHelp) {
                    return null;
                }

                if (command.adminCommand && !(this.isAdmin() || this.isOwner())) {
                    return null;
                }

                return `${_.padEnd(command.name, longestCommand)}${command.adminCommand ? ' - Admin' : ''} - ${command.description}`;
            })
            .filter(line => line !== null);


        let message = `
${_.capitalize(module.name)} Module

\`\`\`
${_.padEnd('Command', longestCommand)} - Description\n
${commands.join("\n")}
\`\`\``;

        this.reply(message).catch(this.logger.error);
    }

    handle() {
        this.responds(/^help$/g, () => {
            if (!this.isPm()) {
                return this.container.get('repository.server').findByIdentifier(this.server.id)
                    .then(server => {
                        if (!server) {
                            return this.container.get('manager.model.server').createFromClientServer(this.server)
                                .then(this.displayHelp)
                        }

                        this.displayHelp(server);
                    })
                    .catch(this.logger.error);
            }

            this.displayHelp();


            return true;
        });
    }
}

module.exports = HelpCommand;