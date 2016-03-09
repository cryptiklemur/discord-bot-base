const AbstractModule = require('../AbstractModule'),
      Module         = require('../Model/Mongo/Module'),
      _              = require('lodash');

class ModuleManager {
    constructor(client) {
        this.client         = client;

        this.modules = [];
    }

    install(module) {
        if (!module instanceof AbstractModule) {
            throw new Error("install must be passed an instance of AbstractModule")
        }

        let cls = new module();
        if (this.modules.find(m => m.name === cls.name)) {
            throw new Error("A module with that name already exists.");
        }

        this.modules.push(cls);
    }

    getCommandsForServer(server) {
        let commands = [];
        this.modules.forEach(module => {
            if (!server) {
                return commands = commands.concat(module.getCommands());
            }

            if (server.findModule(module.name).enabled) {
                return commands = commands.concat(module.getCommands());
            }
        });

        return _.orderBy(commands, ['adminCommand', 'module', 'name'], ['asc', 'asc', 'asc']);
    }

    getModules() {
        return this.modules;
    }
}

module.exports = ModuleManager;