const AbstractCommand = require('../../../AbstractCommand');

class PrefixCommand extends AbstractCommand {
    static get name() {
        return 'prefix';
    }

    static get description() {
        return "Sets the prefix for the bot on the given server";
    }

    static get adminCommand() {
        return true;
    }

    handle() {
        if (!this.isAdminOrOwner()) {
            return false;
        }

        this.responds(/^prefix (.*)$/gi, () => {
            this.container.get('repository.server').findByIdentifier(this.server.id)
                .then(server => {
                    if (!server) {
                        return this.container.get('manager.model.server').createFromClientServer(this.server)
                            .then(server => this.setPrefix(server, matches[1]))
                            .catch(error => {
                                this.reply("Failed setting prefix.");
                                this.logger.error(error);
                            })
                    }

                    this.setPrefix(server, matches[1])
                });
        });
    }

    setPrefix(server, prefix) {
        server.prefix = prefix;
        this.container.get('manager.model.server').update(server)
            .then(() => this.reply(`Server prefix set to: \`${prefix}\``))
            .catch(error => {
                this.reply("Failed setting prefix.");
                this.logger.error(error);
            })

    }
}

module.exports = PrefixCommand;