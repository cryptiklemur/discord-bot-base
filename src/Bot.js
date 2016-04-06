const _              = require('lodash'),
      chalk          = require('chalk'),
      createResolver = require('options-resolver'),
      Loader         = require('./Loader');

class Bot {
    constructor(env, debug, options) {
        this.env   = env;
        this.debug = debug;

        process.on('unhandledRejection', function onError(err) {
            throw err;
        });

        let resolver = this.buildResolver();
        resolver.resolve(options)
            .then(this.buildContainer.bind(this))
            .catch(error => console.error(error, error.stack));
    }

    buildResolver() {
        let resolver = createResolver(),
            pkg      = require('../package');

        resolver
            .setDefaults({
                name:          pkg.name,
                version:       pkg.version,
                author:        pkg.author,
                storage:       'mongo',
                loaderTimeout: 60,
                container:     () => {
                    return {}
                }
            })
            .setDefined(['status', 'queue', 'redis_url', 'mongo_url', 'log_dir', 'token', 'email', 'password'])
            .setRequired([
                'name',
                'version',
                'author',
                'admin_id',
                'prefix',
                'modules'
            ])
            .setAllowedValues('storage', ['mongo', 'mysql'])
            .setAllowedTypes('name', 'string')
            .setAllowedTypes('version', 'string')
            .setAllowedTypes('author', 'string')
            .setAllowedTypes('prefix', 'string')
            .setAllowedTypes('modules', 'array')
            .setAllowedTypes('status', 'string')
            .setAllowedTypes('token', 'string')
            .setAllowedTypes('admin_id', 'string')
            .setAllowedTypes('log_dir', 'string')
            .setAllowedTypes('queue', 'object')
            .setAllowedTypes('redis_url', 'string')
            .setAllowedTypes('mongo_url', 'string')
            .setAllowedTypes('container', 'function');

        return resolver;
    }

    buildContainer(options) {
        if (!options.token && !options.email) {
            throw new Error("Either a token or an email/password is required");
        }
        this.options = options;

        let containerAndLoader = require('./Config/Container')(this),
            loader             = containerAndLoader.loader,
            builder            = containerAndLoader.builder;

        loader.addJson(this.options.container(this));

        this.container = builder.build();

        this.loader = new Loader(this.container, this);
        this.run();
    }

    run() {
        this.logger             = this.container.get('logger');
        this.logger.level       = this.isDebug() ? 'debug' : 'info';
        this.logger.exitOnError = true;

        console.log(chalk.blue(`\n\n\t${this.options.name} v${this.options.version} - by ${this.options.author}\n\n`));

        this.loader.start();

        this.loader.on('ready', this.onReady.bind(this));
    }

    onReady() {
        if (typeof process.send === 'function') {
            this.logger.debug("Sending online message");
            process.send('online');
        }

        this.logger.info("Bot is connected, waiting for messages");

        let client = this.container.get('client');
        client.sendMessage(client.admin, "Bot is connected, waiting for messages");
    }

    isEnv(environment) {
        return environment === this.env;
    }

    isDebug() {
        return this.debug;
    }
}

module.exports = Bot;
