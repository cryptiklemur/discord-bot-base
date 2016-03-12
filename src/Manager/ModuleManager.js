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

        if (!cls.name) {
            cls.name = cls.constructor.name.replace('Module', '').toLowerCase();
        }

        if (this.modules.find(m => m.name === cls.name)) {
            throw new Error("A module with that name already exists.");
        }

        this.modules.push(cls);
    }

    getModule(name) {
        return this.modules.find(module => module.name = name);
    }

    getCommandsForServer(server) {
        let commands = [];
        this.modules.forEach(module => {
            if (!server) {
                return commands = commands.concat(module.getCommands());
            }

            let serverModule = server.findModule(module.name);
            if (serverModule && serverModule.enabled) {
                return commands = commands.concat(module.getCommands());
            }
        });

        return commands;
    }

    getModules() {
        return this.modules;
    }
}

module.exports = ModuleManager;