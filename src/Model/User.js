const mongoose = require('mongoose');

module.exports = mongoose.model('User', {
    identifier: String,
    names: [],
    platforms: [{platform: String, name: String}],
    games: [{game: String, date: String}],
    status: String,
    lastOnline: String,
    lastAvailable: String
});
