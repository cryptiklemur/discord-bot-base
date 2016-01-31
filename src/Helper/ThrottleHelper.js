const moment = require('moment');

class ThrottleHelper {
    constructor() {
        this.throttledMessages = {};
    }

    isThrottled(key, message, length) {
        let id = message.isPm ? message.author.id : message.server.id;

        if (this.throttledMessages[id] === undefined) {
            this.throttledMessages[id]      = {};
            this.throttledMessages[id][key] = Date.now();

            return false;
        }

        if (this.throttledMessages[id][key] === undefined) {
            this.throttledMessages[id][key] = Date.now();

            return false;
        }

        let date = moment(this.throttledMessages[id][key]),
            diff = moment().diff(date, 'seconds');

        return diff < length;
    }
}

module.exports = ThrottleHelper;