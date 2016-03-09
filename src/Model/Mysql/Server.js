const Module = require('./Module');

module.exports = function (db, callback) {
    var Server = db.define(
        {
            identifier: String,
            owner:      String,
            prefix:     {type: String, defaultValue: "%"}
        },
        {
            methods: {
                getEnabledModules: function () {
                    return this.getModules().filter(module => module.enabled);
                }
            }
        }
    );

    Server.hasMany('modules', Module);

    return Server;
};