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
        let moduleManager  = this.container.get('manager.module'),
            commandList    = moduleManager.getCommandsForServer(server),
            longestCommand = Math.max(...commandList.map(command => command.name.length)),
            longestModule  = Math.max(...commandList.map(command => command.module.length));

        longestCommand = longestCommand > 7 ? longestCommand : 7;
        longestModule  = longestModule > 6 ? longestModule : 6;

        let commands = commandList.map((command) => {
                if (command.noHelp) {
                    return null;
                }

                if (command.adminCommand) {
                    return null;
                }

                return `${_.padEnd(command.name, longestCommand)} - ${_.pad(command.module, longestModule)} - ${command.description}${command.adminCommand ? ' - Admin' : ''}`;
            })
            .filter(line => line !== null);

        let prefix = this.prefix;
        if (prefix === '`') {
            prefix = ' `\u200B';
        }

        let message = "Hello! Below you will find a list of my commands.";

        if (!this.isPm()) {
            message += `\nAny of these commands have to be prefix with either \`${prefix}\`, or ${this.client.user.mention()}`;
        }

        message += `

\`\`\`
${_.padEnd('Command', longestCommand)} - ${_.pad('Module', longestModule)} - Description\n
${commands.join("\n")}
\`\`\``;

        if (this.isOwner() || this.isAdmin()) {
            let adminCommands = commandList.map((command) => {
                    if (command.noHelp) {
                        return null;
                    }

                    if (!command.adminCommand) {
                        return null;
                    }

                    return `${_.padEnd(command.name, longestCommand)} - ${_.pad(command.module, longestModule)} - ${command.description}${command.adminCommand ? ' - Admin' : ''}`;
                })
                .filter(line => line !== null);

            message += `

Admin Commands:

\`\`\`
${_.padEnd('Command', longestCommand)} - ${_.pad('Module', longestModule)} - Description\n
${adminCommands.join("\n")}
\`\`\``
        }

        this.reply(message);
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
            }

            this.displayHelp();


            return true;
        });
    }
}

module.exports = HelpCommand;