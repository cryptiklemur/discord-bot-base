const mongoose = require('mongoose'),
      Schema   = mongoose.Schema;


var ignored = new Schema({
    type:       String,
    identifier: String,
    ignored:    {type: Boolean, default: true}
});

ignored.index({type: 1, identifier: 1}, {unique: true});

module.exports = mongoose.model('BaseIgnored', ignored, 'base_ignored');
