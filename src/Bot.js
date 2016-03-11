const _              = require('lodash'),
      chalk          = require('chalk'),
      createResolver = require('options-resolver'),
      Loader         = require('./Loader');

class Bot {
    constructor(env, debug, options) {
        this.env   = env;
        this.debug = debug;

        process.on("unhandledRejection", (reason, p) => {
            console.error("Possibly Unhandled Rejection at: Promise ", p, " reason: ", reason);
        });


        let resolver = this.buildResolver();
        resolver.resolve(options)
            .then(this.buildContainer.bind(this))
            .catch(error => console.error(error.stack));
    }

    buildResolver() {
        let resolver = createResolver(),
            pkg      = require('../package');

        resolver
            .setDefaults({
                name:      pkg.name,
                version:   pkg.version,
                author:    pkg.author,
                storage:   'mongo',
                container: () => {
                    return {}
                }
            })
            .setDefined(['status', 'queue', 'redis_url', 'mongo_url', 'log_dir'])
            .setRequired([
                'name',
                'version',
                'author',
                'token',
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
        this.options = options;

        let containerAndLoader = require('./Config/Container')(this),
            loader = containerAndLoader.loader,
            builder = containerAndLoader.builder;

        loader.addJson(this.options.container(this));

        this.container = builder.build();

        this.run();
    }

    run() {
        this.logger             = this.container.get('logger');
        this.logger.level       = this.isDebug() ? 'debug' : 'info';
        this.logger.exitOnError = true;

        console.log(chalk.blue(`\n\n\t${this.options.name} v${this.options.version} - by ${this.options.author}\n\n`));

        let loader = new Loader(this.container, this);
        loader.start();

        loader.on('ready', this.onReady.bind(this));
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
