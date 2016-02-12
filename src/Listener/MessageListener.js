const MessageManager  = require('../Manager/MessageManager');
const walk            = require('walk');
const chalk           = require('chalk');
const AbstractCommand = require('../Command/AbstractCommand');
const Commands        = require('require-all')(__dirname + '/../Command');

class MessageListener {
    constructor(container) {
        this.container = container;
        this.register  = this.register.bind(this);

        this.commands = [];
    }

    addCommands() {
        this.manager = this.container.get('manager.message');
        this.client  = this.container.get('client');

        if (this.container.hasParameter('commands')) {
            this.container.getParameter('commands').forEach(this.register);
        }

        for (let name in Commands) {
            if (Commands.hasOwnProperty(name)) {
                if (name !== 'AbstractCommand') {
                    this.register(Commands[name]);
                }
            }
        }

        this.container.get('logger').debug("Added " + this.commands.length + " commands");
    }

    register(command) {
        if (!(command.prototype instanceof AbstractCommand)) {
            throw new Error(
                "Command does not extend AbstractCommand. Read the documentation please. (" + command.constructor.name + ")"
            );
        }

        this.commands.push(command);
    }

    handleMessage(message) {
        message = this.manager.create(message);

        if (message.author.id === this.client.user.id) {
            return false;
        }

        if (message.author.id === this.client.admin.id) {
            this.checkCommands(message);
        } else {
            this.container.get('helper.ignore').isNotIgnored(message, this.checkCommands.bind(this, message));
        }
    }

    checkCommands(message) {
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
            } catch (error) {
                this.container.get('logger').error(error);
                this.client.sendMessage(this.client.admin, "I have run into an issue:");
                this.client.sendMessage(this.client.admin, error.message, 200);
                this.client.sendMessage(this.client.admin, error.stack, 400);
            }
        }
    }
}

module.exports = MessageListener;