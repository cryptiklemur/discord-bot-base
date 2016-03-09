module.exports = function (db, callback) {
    return db.define(
        {
            type:       String,
            identifier: String,
            ignored:    {type: Boolean, defaultValue: true}
        }
    );
};