const ModuleManager       = require('../Manager/ModuleManager'),
      ServerModelManager  = require('../Manager/Model/ServerModelManager'),
      IgnoredModelManager = require('../Manager/Model/IgnoredModelManager');

module.exports = {
    "manager.module":        {module: ModuleManager, args: ['@client']},
    "manager.model.server":  {module: ServerModelManager, args: ['%storage%', '@manager.module', '%prefix%']},
    "manager.model.ignored": {module: IgnoredModelManager, args: ['%storage%']}
};
