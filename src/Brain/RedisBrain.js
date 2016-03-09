const Promise = require("bluebird");
const Redis   = require('redis');

class RedisBrain {
    constructor(url) {
        if (url === '') {
            return;
        }

        Promise.promisifyAll(Redis.RedisClient.prototype);
        Promise.promisifyAll(Redis.Multi.prototype);

        let client = Redis.createClient(url);

        client.on("error", function(err) {
            console.error("Error " + err);
        });

        return client;
    }
}

module.exports = RedisBrain;