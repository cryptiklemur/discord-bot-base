const AbstractModule = require('../../AbstractModule');

class CoreModule extends AbstractModule {
    get commandsDir() { return __dirname + '/Command'; }
}

module.exports = CoreModule;
