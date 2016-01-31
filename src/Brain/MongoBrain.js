const mongoose = require('mongoose');

module.exports = function(url) {
    if (url === '') {
        return;
    }

    mongoose.connect(url);

    return mongoose;
};