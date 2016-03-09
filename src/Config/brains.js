const MemoryBrain = require('../Brain/MemoryBrain'),
      RedisBrain  = require('../Brain/RedisBrain');

module.exports = {
    "brain.memory": {module: MemoryBrain},
    "brain.redis":  {module: RedisBrain, args: ['%redis_url%']}
};
