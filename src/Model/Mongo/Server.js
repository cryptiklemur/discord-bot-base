const mongoose = require('mongoose'),
      Schema   = mongoose.Schema,
      Module   = require('./Module');


var server = new Schema({
    identifier: String,
    owner:      String,
    prefix:     {type: String, default: "%"},
    modules:    [Module]
});


server.methods.findModule = function (name) {
    return this.modules.find(module => module.name === name);
};

server.methods.getEnabledModules = function () {
    return this.modules.filter(module => module.enabled);
};

module.exports = mongoose.model('BaseServer', server, 'base_servers');

