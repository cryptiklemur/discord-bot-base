const AbstractCommand = require('./AbstractCommand');

class HelpCommand extends AbstractCommand {
    static get name() { return 'help'; }

    static get description() { return "Shows the help menu"; }

    static get help() { return "<command> - Shows the help for the given command"; }

    setCommands(commands) {
        this.commands = commands;
    }

    handle() {
        this.responds(/^(help)?$/g, () => {
            if (this.message.message.attachments.length !== 0) {
                return;
            }

            let commands = this.commands.map((command) => {
                return `\t${command.name} - ${command.description}`;
            });

            let prefix = this.message.prefix;
            if (prefix === '`') {
                prefix = ' `\u200B';
            }


            this.reply(
                `Meep Morp. Hello! I am a bot :D.
Any of these commands have to be prefix with either \`${prefix}\`, or ${this.client.user.mention()}.

\`\`\`
Commands:
${commands.join("\n")}
\`\`\``
            );

            return true;
        });
    }
}

module.exports = HelpCommand;