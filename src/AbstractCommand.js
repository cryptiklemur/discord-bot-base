const chalk              = require('chalk'),
      _                  = require('lodash'),
      moment             = require('moment'),
      prettyjson         = require('prettyjson'),
      MAX_MESSAGE_LENGTH = 2000,
      MAX_MESSAGE_COUNT  = 10;

class AbstractCommand {
    static get name() {
        throw new Error("Commands must override get name()");
    }

    static get description() {
        throw new Error("Commands must override get description()");
    }

    static get adminCommand() {
        return false;
    }

    static get help() {
        return "None";
    }

    static get noHelp() {
        return false;
    }

    get server() {
        return this.message.channel.server === undefined ? 'pm' : this.message.channel.server;
    }

    get channel() {
        return this.message.channel === undefined ? 'pm' : this.message.channel;
    }

    get time() {
        return moment(this.message.timestamp).format("HH:mm:ss");
    }

    get author() {
        return this.message.author;
    }

    get botMention() {
        return this.rawContent.indexOf(this.prefix) === 0 || this.message.isMentioned(this.client.user) || this.pm;
    }

    get content() {
        let content = this.rawContent;

        let regex = new RegExp(`^(${this.client.user.mention()})|(\\${this.prefix})`);
        content   = _.trim(content.replace(regex, ''));

        return content;
    }

    get rawContent() {
        return this.message.content;
    }

    get pm() {
        return this.message.channel.server === undefined;
    }

    get prefix() {
        return !this.isPm() ? this.dbServer.prefix : undefined;
    }

    get mentions() {
        let users = [];

        for (let index in this.message.mentions) {
            if (this.message.mentions.hasOwnProperty(index)) {
                let mention = this.message.mentions[index];
                if (mention.id !== undefined && mention.username !== undefined) {
                    users.push({id: mention.id, name: mention.username, mention: mention.mention});
                }
            }
        }

        return users;
    }

    isPm() {
        return this.pm;
    }

    constructor(container, message, dbServer) {
        if (this.constructor === AbstractCommand) {
            throw new Error("Can't instantiate abstract class!");
        }

        this.container = container;
        this.message   = message;
        this.dbServer  = dbServer;

        this.logger   = container.get('logger');
        this.throttle = container.get('helper.throttle');
        this.client   = container.get('client');

        this.initialize();
    }

    initialize() {
    }

    isThrottled(key, length) {
        return this.throttle.isThrottled(key, this.message, length);
    }

    isAdmin() {
        return this.author.id === this.client.admin.id;
    }

    isOwner(pm) {
        pm = pm === undefined ? false : pm;

        if (this.isPm()) {
            return pm;
        }

        if (!this.server || !this.server.owner) {
            return false;
        }

        return this.author.id === this.server.owner.id;
    }

    isAdminOrOwner(pm) {
        return this.isAdmin() || this.isOwner(pm);
    }

    reply(content, delay, deleteDelay, mention) {
        if (mention) {
            content = this.author.mention() + ', ' + content;
        }

        return this.sendMessage(this.message, content, delay, deleteDelay);
    }

    sendMessage(location, message, delay, deleteDelay) {
        if (message.length > MAX_MESSAGE_LENGTH * MAX_MESSAGE_COUNT) {
            return this.logger.error("Message is too long. Will spam API.");
        }

        delay = delay === undefined ? 0 : delay;
        if (delay) {
            return setTimeout(() => this.sendMessage(location, message, 0, deleteDelay), delay);
        }

        if (message.length > 2000) {
            this.logger.error("Message too long to send: " + message);
            throw error("Message too long");
        }

        return new Promise((resolve, reject) => {
            this.client.sendMessage(location, message)
                .catch(reject)
                .then(message => {
                    if (deleteDelay) {
                        return this.client.deleteMessage(message, {wait: deleteDelay})
                            .catch(reject)
                            .then(() => {
                                resolve(message);
                            });
                    }

                    resolve(message);
                });
        });
    }

    handle() {
        throw Error("Commands must override handleMessage");
    }

    getMatches(content, regex, callback, noPrint) {
        let matches = regex.exec(content);

        if (matches === null) {
            return false;
        }

        let result = callback(matches);

        if (!noPrint && result !== false) {
            let array = {
                Command: {
                    time:       this.time,
                    author:     this.author.username,
                    server:     this.server !== 'pm' ? this.server.name : 'pm',
                    channel:    this.channel.name,
                    content:    this.content,
                    botMention: this.botMention,
                    pm:         this.pm,
                    regex:      regex ? regex.toString() : 'uh.....',
                    matches:    matches,
                    mentions:   this.mentions
                }
            };

            this.logger.info("\n" + prettyjson.render(array));
        }
    }

    hears(regex, callback, noPrint) {
        if (noPrint === undefined) {
            noPrint = false;
        }

        return this.getMatches(this.rawContent, regex, callback, noPrint);
    }

    responds(regex, callback, noPrint) {
        if (!this.botMention) {
            return;
        }

        if (noPrint === undefined) {
            noPrint = false;
        }

        return this.getMatches(this.content, regex, callback, noPrint)
    }
}

module.exports = AbstractCommand;
