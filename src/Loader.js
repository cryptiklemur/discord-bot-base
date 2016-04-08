const mongoose     = require("mongoose"),
      orm          = require("orm"),
      _            = require('lodash'),
      EventEmitter = require("events").EventEmitter;

class Loader extends EventEmitter {
    constructor(container, Bot) {
        super();

        this.container = container;
        this.bot       = Bot;
        this.logger    = container.get('logger');
        this.storage   = container.getParameter('storage');
        this.loaded    = {
            databases: {
                mongo: this.storage !== 'mongo',
                mysql: this.storage !== 'mysql'
            },
            discord:   false,
            modules:   false,
            messages:  false,
            extra:     {}
        };

        this.on('loaded', this.checkLoaded.bind(this));
        this.failCheck = setTimeout(this.checkLoaded.bind(this, true), container.getParameter('loader_timeout') * 1000);
        this.printLoaded = _.throttle(this.printLoaded.bind(this), 1000);
    }

    start() {
        this.emit('start.pre', this);
        this.loadStorage();
        this.loadModules();
        this.emit('start.post', this);
    }

    loadStorage() {
        if (this.storage === 'mongo') {
            mongoose.connect(this.container.getParameter('mongo_url'));
            let db = mongoose.connection;

            db.once('open', () => {
                this.setLoaded('databases', 'mongo');
            })
        }

        if (this.storage === 'mysql') {
            orm.connect(this.container.getParameter('mysql_url'), (error, db) => {
                if (error) {
                    throw new Error(error);
                }

                db.load(__dirname + '/Model/Mysql/Module');
                db.load(__dirname + '/Model/Mysql/Server');

                db.sync(error => {
                    if (error) {
                        throw new Error(error);
                    }

                    this.setLoaded('databases', 'mysql');
                });
            })
        }
    }

    loadDiscord() {
        let logger = this.container.get('logger'),
            data   = this.container.getParameter('login'),
            client = this.container.get('client'),
            login;


        login = data.token ? client.loginWithToken(data.token) : client.login(data.email, data.password);

        login.catch(error => {
            logger.error("There was an error logging in: \n\n\t" + error + "\n");
            process.exit(1);
        });

        client.on('ready', () => {
            this.waitForNoChange(
                () => client.servers.length,
                () => {
                    this.logger.info("All servers seem to be loaded.");

                    this.setLoaded('discord');
                    client.admin = client.users.get('id', this.container.getParameter('admin_id'));

                    if (this.container.getParameter('status') !== undefined) {
                        client.setStatus('online', this.container.getParameter('status'));
                    }

                    this.container.get('handler.message').run(() => {
                        this.setLoaded('messages');
                    });
                },
                this.printLoaded.bind(this)
            );
        });

        client.on('error', logger.error);
        client.on('disconnect', () => logger.info("Bot has disconnected"));
        if (this.container.getParameter('dev')) {
            client.on('debug', (message) => logger.debug(message));
        }
    }

    printLoaded() {
        let loaded = this.container.get('client').servers.length;
        this.logger.info(`Servers Loaded: ${loaded}`);
    }

    loadModules() {
        let moduleManager = this.container.get('manager.module');

        moduleManager.install(require('./Module/Core/CoreModule'));
        for (let index in this.bot.options.modules) {
            if (this.bot.options.modules.hasOwnProperty(index)) {
                moduleManager.install(this.bot.options.modules[index]);
            }
        }

        this.setLoaded('modules');
    }

    getModuleCount() {
        return this.container.get('manager.module').getModules().length;
    }

    checkLoaded(fail) {
        this.emit('checkLoaded');
        fail = fail !== undefined;

        if (fail) {
            throw new Error("Failed initializing. Loaded Information: " + JSON.stringify(this.loaded));
        }

        this.logger.debug({
            Status: {
                Ready:    this.isLoaded() ? 'Yes' : 'No',
                Storage:  this.storage,
                Storages: {
                    Mongo: this.loaded.databases.mongo ? 'Yes' : 'No',
                    Mysql: this.loaded.databases.mysql ? 'Yes' : 'No'
                },
                Discord:  this.loaded.discord ? 'Logged In' : 'Logging In',
                Messages: this.loaded.messages ? 'Listening' : 'Starting listener',
                Modules:  this.loaded.modules ? this.getModuleCount() : 'Loading modules',
                Extra:    this.loaded.extra
            }
        });

        if (!this.isLoaded()) {
            return false;
        }

        clearTimeout(this.failCheck);
        this.failCheck = undefined;

        setTimeout(() => {
            this.logger.debug("Finished loading. Emitting ready event");
            this.emit('ready');
        }, 1500);
    }

    setLoaded(type, subtype) {
        if (!subtype) {
            this.loaded[type] = true;
            this.emit('loaded.' + type);
        } else {
            this.loaded[type][subtype] = true;
            this.emit('loaded.' + type + '.' + subtype);
        }

        this.emit('loaded');
    }

    isLoaded() {
        if (this.storage === 'mongo' && !this.loaded.databases.mongo) {
            return false;
        }

        if (this.storage === 'mysql' && !this.loaded.databases.mysql) {
            return false;
        }

        for (let type in this.loaded.extra) {
            if (!this.loaded.extra.hasOwnProperty(type)) {
                continue;
            }

            if (!this.loaded.extra[type]) {
                return false;
            }
        }

        if (this.loaded.modules && !this.loaded.discord && !this.loadingDiscord) {
            this.loadingDiscord = true;
            this.loadDiscord();
        }

        return this.loaded.discord && this.loaded.messages;
    }

    waitForNoChange(item, callback, nonReadyCallback, length) {
        length             = !length ? 5000 : length;
        const intervalTime = 50;
        let last           = 0, time = 0;
        let interval       = setInterval(() => {
            if (last === item()) {
                if (length - time <= 0) {
                    clearInterval(interval);

                    return callback();
                }

                time += intervalTime;
            } else {
                time = 0;
            }

            nonReadyCallback();
            last = item();
        }, intervalTime)
    }


}

module.exports = Loader;
