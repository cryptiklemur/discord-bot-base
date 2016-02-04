const MessageManager  = require('../Manager/MessageManager');
const walk            = require('walk');
const chalk           = require('chalk');
const AbstractCommand = require('../Command/AbstractCommand');

class MessageListener {
    constructor(container) {
        this.container = container;
        this.register = this.register.bind(this);

        this.commands = [];
    }

    listen() {
        this.manager = this.container.get('manager.message');
        this.client  = this.container.get('client');

        if (this.container.hasParameter('commands')) {
            this.container.getParameter('commands').forEach(this.register);
        }

        let walker = walk.walk(__dirname + '/../Command/', {followLinks: false});

        walker.on('file', (root, stat, next) => {
            let cls = require(__dirname + '/../Command/' + stat.name);

            if (stat.name !== 'AbstractCommand.js') {
                this.register(cls);
            }

            next();
        });

        walker.on('end', () => {
            this.container.get('logger').debug("Added " + this.commands.length + " commands");
            this.client.on('message', this.handleMessage.bind(this));
        })

    }

    register(command) {
        if (!(command.prototype instanceof AbstractCommand)) {
            throw new Error(
                "Command does not extend AbstractCommand. Read the documentation please. ("+command.constructor.name+")"
            );
        }

        this.commands.push(command);
    }

    handleMessage(message) {
        message = this.manager.create(message);

        if (message.author.id === this.client.user.id) {
            return false;
        }

        for (let index in this.commands) {
            if (!this.commands.hasOwnProperty(index)) {
                continue;
            }

            let cls     = this.commands[index],
                command = new cls(this.container, message);

            if (typeof command.setCommands === 'function') {
                command.setCommands(this.commands);
            }

            try {
                command.handle();
            } catch (e) {
                this.client.sendMessage(this.client.admin, "I have run into an issue:");
                this.client.sendMessage(this.client.admin, error.message);
                this.client.sendMessage(this.client.admin, error.stack);
            }
        }
    }
}

module.exports = MessageListener;