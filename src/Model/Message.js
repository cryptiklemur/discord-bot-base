const _      = require('lodash');
const moment = require('moment');

class Message {
    get server() { return this.message.channel.server === undefined ? 'pm' : this.message.channel.server; }

    get channel() { return this.message.channel === undefined ? 'pm' : this.message.channel; }

    get time() { return moment(this.message.timestamp).format("HH:mm:ss"); }

    get author() { return this.message.author; }

    get botMention() { return this.rawContent.indexOf(this.prefix) === 0 || this.message.isMentioned(this.client.user) || this.pm; }

    get content() {
        let content = this.rawContent;

        let regex = new RegExp(`^(${this.client.user.mention()})|(\\${this.prefix})`);
        content     = _.trim(content.replace(regex, ''));

        return content;
    }

    get rawContent() { return this.message.content; }

    get pm() { return this.message.channel.server === undefined; }

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

    constructor(client, prefix, message) {
        this.client  = client;
        this.prefix  = prefix;
        this.message = message;
    }

    isPm() {
        return this.pm;
    }

    toArray() {
        return {
            time:       this.time,
            author:     this.author.username,
            server:     this.server !== 'pm' ? this.server.name : this.server,
            channel:    this.channel.name,
            content:    this.content,
            botMention: this.botMention,
            pm:         this.pm,
            mentions:   this.mentions
        };
    }
}

module.exports = Message;
