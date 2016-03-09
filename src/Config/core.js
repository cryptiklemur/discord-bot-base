const EventEmitter = require('events'),
      Client       = require('discord.js').Client,
      Logger       = require('../Logger');

module.exports = {
    dispatcher: {module: EventEmitter},
    logger:     {module: Logger, args: ['%debug%', '%log_dir%', '%name%']},
    client:     {module: Client, args: ['%client_args%']}
};
