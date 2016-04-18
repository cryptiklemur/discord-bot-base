const AbstractCommand = require('../../../AbstractCommand');

class EvalCommand extends AbstractCommand {
    static get name() { return 'eval'; }

    static get description() { return "Evaluates the given code"; }

    static get adminCommand() { return true; }

    handle() {
        this.responds(/^eval(?:\s+)```[a-z]*\n([\s\S]*)?\n```$/, (matches) => {
            this.evalCode(matches[1]);
        });

        this.responds(/^eval(?:\s+)`?([^`]*)?`?$/, (matches) => {
            this.evalCode(matches[1]);
        });
    }

    evalCode(code) {
        if (!this.isAdmin()) {
            return false;
        }

        let message;
        this.reply("Executing code.")
            .then(message => {
                
                let response;
                try {
                    response = eval(code);
                } catch (error) {
                    response = error.message;
                }

                if (Array.isArray(response) || typeof response === 'object') {
                    response = JSON.stringify(response);
                }

                this.client.updateMessage(message, "```\n" + response + "\n```")
                    .catch(error => this.logger.error("Failed updating message for eval"));
            })
            .catch(this.logger.error);
    }
}

module.exports = EvalCommand;