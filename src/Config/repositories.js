const ServerRepository  = require('../Repository/ServerRepository'),
      IgnoredRepository = require('../Repository/IgnoredRepository');

module.exports = {
    "repository.server":  {module: ServerRepository, args: ['%storage%', '@brain.memory']},
    "repository.ignored": {module: IgnoredRepository, args: ['%storage%']}
};
