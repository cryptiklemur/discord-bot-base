const AbstractCommand = require('./AbstractCommand');
const chalk           = require('chalk');

class RestartCommand extends AbstractCommand {
    static get name() { return 'restart'; }

    static get description() { return "Restarts the server - Requires admin"; }

    handle() {
        if (this.client.admin === undefined) {
            return false;
        }

        this.responds(/^(restart)$/gi, () => {
            if (this.client.admin.id !== this.message.author.id) {
                return false;
            }

            this.reply("Restarting.");
            setTimeout(process.exit, 300);

            return true;
        });
    }
}

module.exports = RestartCommand;