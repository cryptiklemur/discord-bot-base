const IgnoreHelper   = require('../Helper/IgnoreHelper'),
      ThrottleHelper = require('../Helper/ThrottleHelper'),
      ChannelHelper  = require('../Helper/ChannelHelper');

module.exports = {
    "helper.ignore":   {
        module: IgnoreHelper,
        args:   ['@client', '@repository.ignored', '@manager.model.ignored', '@logger']
    },
    "helper.throttle": {module: ThrottleHelper},
    "helper.channel":  {module: ChannelHelper, args: ['@client']}
};
