const prettyjson = require('prettyjson');
const chalk      = require('chalk');

class AbstractCommand {
    static get name() { throw Error("Commands must override get name()"); }

    static get description() { throw Error("Commands must override get description()"); }

    static get help() { return "None"; }

    constructor(container, message) {
        this.container = container;
        this.message   = message;

        this.logger = container.get('logger');
        this.throttle = container.get('helper.throttle');
        this.client   = container.get('client');

        this.initialize();
    }

    initialize() {}

    isThrottled(key, length) {
        return this.throttle.isThrottled(key, this.message, length);
    }

    reply(content, delay) {
        delay = delay === undefined ? 0 : delay;

        setTimeout(() => {
            this.client.reply(this.message.message, content);
        }, 50 + delay)
    }

    sendMessage(location, message, delay) {
        delay = delay === undefined ? 0 : delay;

        setTimeout(() => {
            this.client.sendMessage(location, message);
        }, 50 + delay)
    }

    handle() {
        throw Error("Commands must override handleMessage");
    }

    getMatches(content, regex, callback, noPrint) {
        let matches = regex.exec(content);

        this.logger.debug("Matching content against " + regex.toString(), content, matches !== null);
        if (matches === null) {
            return false;
        }

        let result = callback(matches);

        if (!noPrint && result !== false) {
            let array   = this.message.toArray();
            array.regex = regex.toString();

            this.logger.log('info', "Command Executed", array);
        }
    }

    hears(regex, callback, noPrint) {
        if (noPrint === undefined) {
            noPrint = false;
        }

        return this.getMatches(this.message.rawContent, regex, callback, noPrint);
    }

    responds(regex, callback, noPrint) {
        if (!this.message.botMention) {
            return;
        }

        if (noPrint === undefined) {
            noPrint = false;
        }

        return this.getMatches(this.message.content, regex, callback, noPrint)
    }
}

module.exports = AbstractCommand;
