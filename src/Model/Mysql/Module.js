module.exports = function (db, callback) {
    return db.define({
        name:    String,
        enabled: Boolean
    });
};