const mongoose = require('mongoose');

module.exports = function(url) {
    if (url === undefined) {
        return;
    }

    mongoose.connect(url);

    return mongoose;
};