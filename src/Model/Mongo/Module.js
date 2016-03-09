const Schema = require('mongoose').Schema;

module.exports = new Schema({
    name:    String,
    enabled: Boolean
});
