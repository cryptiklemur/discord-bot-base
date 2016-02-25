const _                = require('lodash');
const chalk            = require('chalk');
const ContainerBuilder = require('crate-js').ContainerBuilder;
const createResolver   = require('options-resolver');

class Bot {
    constructor(env, debug, options) {
        this.env   = env;
        this.debug = debug;

        let resolver = this.buildResolver();
        resolver.resolve(options)
            .then(this.buildContainer.bind(this))
            .catch(error => { throw error });
    }

    buildContainer(options) {
        this.options      = options;
        let container     = require('./container')(this),
            userContainer = this.options.container(this);

        container = _.merge({}, container, userContainer);

        this.container = ContainerBuilder.buildFromJson(container);

        this.run();
    }

    buildResolver() {
        let resolver = createResolver(),
            pkg      = require('../package');

        resolver
            .setDefaults({
                name:      pkg.name,
                version:   pkg.version,
                author:    pkg.author,
                container: () => {
                    return {}
                }
            })
            .setDefined(['status', 'queue', 'redis_url', 'mongo_url', 'log_dir'])
            .setRequired([
                'name',
                'version',
                'author',
                'email',
                'password',
                'admin_id',
                'prefix',
                'commands'
            ])
            .setAllowedTypes('name', 'string')
            .setAllowedTypes('version', 'string')
            .setAllowedTypes('author', 'string')
            .setAllowedTypes('prefix', 'string')
            .setAllowedTypes('commands', 'array')
            .setAllowedTypes('status', 'string')
            .setAllowedTypes('email', 'string')
            .setAllowedTypes('password', 'string')
            .setAllowedTypes('admin_id', 'string')
            .setAllowedTypes('log_dir', 'string')
            .setAllowedTypes('queue', 'object')
            .setAllowedTypes('redis_url', 'string')
            .setAllowedTypes('mongo_url', 'string')
            .setAllowedTypes('container', 'function');

        return resolver;
    }

    run() {
        this.logger             = this.container.get('logger');
        this.logger.level       = this.debug ? 'debug' : 'info';
        this.logger.exitOnError = true;

        console.log(
            chalk.blue(
                `

    ${this.options.name} v${this.options.version} - by ${this.options.author}

                `
            )
        );

        this.client = this.container.get('client');

        this.client.login(this.options.email, this.options.password)
            .catch(error => {
                this.logger.error("There was an error logging in: \n\n\t" + chalk.red(error) + "\n");
                process.exit(1);
            });

        this.client.on('ready', this.onReady.bind(this));
        this.client.on('error', this.logger.error);
        this.client.on('disconnect', this.onDisconnect.bind(this));
        if (this.container.getParameter('dev')) {
            this.client.on('debug', (message) => this.logger.log(chalk.cyan.dim(message)));
        }
    }

    onReady() {
        this.client.admin = this.client.users.get('id', this.container.getParameter('admin_id'));

        if (this.options.status !== undefined) {
            this.client.setStatus('online', this.options.status);
        }

        this.container.get('listener.message').addCommands();

        this.container.get('handler.message').run(() => {
            this.logger.info("Bot is connected, waiting for messages");
            this.client.sendMessage(this.client.admin, "Bot is connected, waiting for messages");

            if (typeof process.send === 'function') {
                this.logger.debug("Sending online message");
                process.send('online');
            }
        });
    }

    onDisconnect() {
        this.logger.log("Bot has disconnected");
    }

    isEnv(environment) {
        return this.environment === this.env;
    }

    isDebug() {
        return this.debug;
    }
}

module.exports = Bot;
