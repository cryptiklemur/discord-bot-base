const AbstractCommand = require('./AbstractCommand');
const _               = require('lodash');

class IgnoreCommand extends AbstractCommand {
    static get name() { return 'ignore'; }

    static get description() { return "Ignores servers, channels, and users."; }

    static get help() { return 'Pass a server ID, a channel mention, or a user mention to ignore.'; }

    static get noHelp() { return true; }

    initialize() {
        this.helper = this.container.get('helper.ignore');
    }

    handle() {
        if (this.client.admin === undefined) {
            return false;
        }

        if (this.client.admin.id !== this.message.author.id && this.client.user.id !== this.message.author.id) {
            return false;
        }

        this.responds(/^ignore$/, () => {
            return this.reply(IgnoreCommand.help);
        });

        this.responds(/^ignore reset$/, () => {
            this.helper.reset();
            this.reply("Ignores reset");
        });

        this.responds(/^ignore list$/, () => {
            if (!this.message.isPm()) {
                return;
            }

            this.helper.getIgnores(ignores => {
                let message = "The following have been ignored: \n\n";

                ignores.forEach((ignore, index) => {
                    if (!ignore.ignored) {
                        return;
                    }

                    let name = '';
                    if (ignore.type === 'server') {
                        let server = this.client.servers.get('id', ignore.id);
                        if (server === null) {
                            return;
                        }

                        name = server.name;
                    } else if (ignore.type === 'channel') {
                        let temp = ignore.id.split('-'),
                            server = this.client.servers.get('id', temp[0]);
                        name = server.name + ' - ' + server.channels.get('id', temp[1]).name;
                    } else {
                        name = this.client.users.get('id', ignore.id).name;
                    }

                    message += `\`${index+1}.\` **${_.capitalize(ignore.type)}**: **${name}**\n`;
                });

                this.reply(message);
            })
        });

        this.responds(/^ignore (\d+)$/, matches => {
            let id     = matches[1],
                server = this.client.servers.get('id', id);

            this.helper.toggleIgnore(
                'server',
                id,
                () => {
                    this.helper.getIgnores(ignores => {
                        let ignored = ignores.find(item => item.type === 'server' && item.id === id).ignored;
                        this.reply(`Server has been ${ignored ? 'ignored' : 'unignored'}: \`${server.name}\``);
                    });
                }
            );
        });

        this.responds(/^ignore <#(\d+)>$/, matches => {
            let id      = matches[1],
                channel = this.message.server.channels.get('id', id);

            this.helper.toggleIgnore(
                'channel',
                this.message.server.id + '-' + id,
                () => {
                    this.helper.getIgnores(ignores => {
                        let ignored = ignores.find(item => item.type === 'channel' && item.id === id).ignored;
                        this.reply(`Channel has been ${ignored ? 'ignored' : 'unignored'}: \`${channel.name}\``);
                    });
                }
            );
        });

        this.responds(/^ignore <@(\d+)>$/, matches => {
            let id   = matches[1],
                user = this.client.users.get('id', id);

            this.helper.toggleIgnore(
                'user',
                id,
                () => {
                    this.helper.getIgnores(ignores => {
                        let ignored = ignores.find(item => item.type === 'user' && item.id === id).ignored;
                        this.reply(`User has been ${ignored ? 'ignored' : 'unignored'}: \`${user.name}\``);
                    });
                }
            );
        });
    }
}

module.exports = IgnoreCommand;