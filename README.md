# discord-bot-base

This is a base bot for Discord using Javascript.

## Installation

### Requirements

This module requires 

Install with NPM

```bash
npm install --save discord-bot-base
```

## Usage

The goal of this repository, is to make it simple to create a bot, and add on commands. To get started just create an
instance of [`Bot`](blob/master/src/Bot.js).

```javascript
'use strict';

const BaseBot = require('discord-bot-base');
const TestCommand = require('./src/Command/TestCommand')

new BaseBot.Bot('dev', true, {
    admin_id:  '<your user id>',
    email:     '<your bot login>',
    password:  '<your bot password>',
    log_dir:   '<location of logs directory>',
    commands:  [TestCommand],
    prefix:    "!",
});
```

The arguments passed to `Bot` are first, the `environment` (generally 'dev' or 'prod'), `debug` (adds extra logging), and 
an array of `options`. 

*The keys that are provided to `options` (`admin_id`, `email`, `password`, `commands`, and `prefix` are all required).*

Below is a list of options you can pass:

* `name` - Name of the bot. This is just for the output on the CLI. Not necessary, and will default to `discord-base-bot`
* `version` - Version of the bot. This is also just for the output on the CLI. Not necessary, and will default to the current version of `discord-base-bot`
* `author` - Author of the bot. This is again, just for the output on the CLI. Not necessary, and will default to the author of `discord-base-bot`
* `status` - Status of the bot. Will show up in the user list as "Playing <status>"
* `email` - Login for the bot. This is required.
* `password` - Password for the bot. This is required.
* `prefix` - Prefix the bot will use for commands. This is required. Try not to use common characters if you plan to be on big servers.
* `admin_id` - User ID of the account you want to have access to admin commands. (e.g. the restart command)
* `container` - Advanced. For now, if you need to add this, message me in the discord api server. Required to use mysql/mongo/redis stuff.
* `commands` - An array of commands. The array should contain modules of commands. Check out an example below of a command.
* `mongo_url` - a Fully qualified mongo dsn. e.g. `mongodb://localhost/`
* `redis_url` - a Fully qualified redis dsn. e.g. `redis://localhost/`
* `queue` - An object of config variables for [rabbitmq](https://github.com/postwait/node-amqp#connection-options-and-url)

If you specify queue, you will be able to set up your bot with cluster support, with PM2.

### Command Example

Below, is what the Stats command looks like:

```javascript
const AbstractCommand = require('discord-base-bot').AbstractCommand;

class StatsCommand extends AbstractCommand {
    static get name() { return 'stats'; }

    static get description() { return "Shows the bot stats"; }

    handle() {
        this.responds(/^stats$/g, () => {
            let servers  = this.client.servers.length,
                channels = this.client.channels.length,
                users    = this.client.users.length,
                online   = this.client.users.filter(u => u.status != "offline").length;

            this.reply(
                `Currently joined to: ${servers} servers with ${online}/${users} members and ${channels} text channels.`
            );
        });
    }
}

module.exports = StatsCommand;
```

Take note of the static getters at the top. These are used for the help command.

All commands are required to extend [`AbstractCommand`](blob/master/src/Command/AbstractCommand.js). AbstractCommand provides a couple helper methods.
A few to note are:

* `responds` - Used when you want the bot to respond to a direct mention, or command. Takes a regex, with the second argument being a callback if a match was found. The callback is passed an array of matches.
* `hears` - Used when you want the bot to listen for a phrase. Takes a regex, with the second argument being a callback if a match was found. The callback is passed an array of matches.
* `sendMessage` - Shortcut for discord.js's client.sendMessage
* `reply` - Shortcut for discord.js's client.reply, just pass a message.
* `isThrottled` - Lets you throttle commands. Pass a key, and how long (in seconds) to throttle for.
* `handle` - This method is required for all commands as well. All your logic should go in here.
