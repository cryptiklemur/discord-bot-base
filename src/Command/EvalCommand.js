const AbstractCommand = require('./AbstractCommand');

class EvalCommand extends AbstractCommand {
    static get name() { return 'eval'; }

    static get description() { return "Evaluates the given code - Requires admin"; }

    handle() {
        if (this.client.admin === undefined) {
            return false;
        }

        this.responds(/^eval(?:\s+)```[a-z]*\n([\s\S]*)?\n```/, (matches) => {
            if (this.client.admin.id !== this.message.author.id) {
                return false;
            }

            this.reply("Executing code.");
            let response = eval(matches[1]);
            this.sendMessage(this.message.channel, response, 200);
        });
    }
}

module.exports = EvalCommand;