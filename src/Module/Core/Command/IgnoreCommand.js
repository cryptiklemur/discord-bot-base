const AbstractCommand = require('../../../AbstractCommand'),
      _               = require('lodash');

class IgnoreCommand extends AbstractCommand {
    static get name() {
        return 'ignore';
    }

    static get description() {
        return "Ignores servers, channels, and users";
    }

    static get help() {
        return 'Pass a server ID, a channel mention, or a user mention to ignore.';
    }

    static get adminCommand() {
        return true;
    }

    initialize() {
        this.helper = this.container.get('helper.ignore');
    }

    handle() {
        if (!this.isAdmin()) {
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
            this.helper.getIgnores(ignores => {
                let message = "The following have been ignored: \n\n```\n";

                ignores.forEach((ignore, index) => {
                    if (!ignore.ignored) {
                        return;
                    }

                    let name = '';
                    if (ignore.type === 'server') {
                        let server = this.client.servers.get('id', ignore.identifier);
                        if (server === null) {
                            return;
                        }

                        name = server.name;
                    } else if (ignore.type === 'channel') {
                        let temp   = ignore.identifier.split('-'),
                            server = this.client.servers.get('id', temp[0]);
                        name       = server.name + ' - ' + server.channels.get('id', temp[1]).name;
                    } else {
                        name = this.client.users.get('id', ignore.identifier).name;
                    }

                    message += `${index + 1}. ${_.padEnd(_.capitalize(ignore.type) +":", 8)} ${name}\n`;
                });

                this.reply(message + "\n```");
            })
        });

        this.responds(/^ignore (\d+)$/, matches => {
            let id     = matches[1],
                server = this.client.servers.get('id', id);

            this.helper.toggleIgnore('server', id)
                .then(ignored => {
                        this.reply(`Server has been ${ignored.ignored ? 'ignored' : 'unignored'}: \`${server.name}\``);
                    }
                )
                .catch(this.logger.error);
        });

        this.responds(/^ignore <#(\d+)>$/, matches => {
            let id      = matches[1],
                channel = this.server.channels.get('id', id);

            this.helper.toggleIgnore('channel', this.server.id + '-' + id)
                .then(ignored => {
                        this.reply(`Channel has been ${ignored.ignored ? 'ignored' : 'unignored'}: \`${channel.name}\``);
                    }
                )
                .catch(this.logger.error);
        });

        this.responds(/^ignore <@(\d+)>$/, matches => {
            let id   = matches[1],
                user = this.client.users.get('id', id);

            this.logger.info("Ignoring " + user.username);
            this.helper.toggleIgnore('user', id)
                .then(ignored => {
                        this.reply(`User has been ${ignored.ignored ? 'ignored' : 'unignored'}: \`${user.name}\``);
                    }
                )
                .catch(this.logger.error);
        });
    }
}

module.exports = IgnoreCommand;