const EventEmitter    = require('events');
const winston         = require('winston');
const Discord         = require('discord.js');
const Logger          = require('./Logger');
const MemoryBrain     = require('./Brain/MemoryBrain');
const RedisBrain      = require('./Brain/RedisBrain');
const MongoBrain      = require('./Brain/MongoBrain');
const RabbitQueue     = require('./Queue/RabbitQueue');
const MessageListener = require('./Listener/MessageListener');
const IgnoreHelper    = require('./Helper/IgnoreHelper');
const ThrottleHelper  = require('./Helper/ThrottleHelper');
const ChannelHelper   = require('./Helper/ChannelHelper');
const MessageManager  = require('./Manager/MessageManager');
const MessageHandler  = require('./Handler/MessageHandler');

module.exports = (Bot) => {
    return {
        "parameters": {
            "env":         Bot.env,
            "dev":         Bot.env === 'dev',
            "debug":       Bot.debug,
            "prefix":      Bot.options.prefix,
            "name":        Bot.options.name,
            "login":       {
                "email":    Bot.options.email,
                "password": Bot.options.password
            },
            "admin_id":    Bot.options.admin_id,
            "commands":    Bot.options.commands,
            "log_dir":     Bot.options.log_dir || null,
            "redis_url":   Bot.options.redis_url || "",
            "mongo_url":   Bot.options.mongo_url || "",
            "queue":       Bot.options.queue || {},
            "client_args": {forceFetchUsers: true}
        },
        "services":   {
            "dispatcher":       {"module": EventEmitter},
            "logger":           {"module": Logger, "args": ['%debug%', '%log_dir%', '%name%']},
            "client":           {"module": Discord.Client, "args": ['%client_args%']},
            "queue.rabbit":     {"module": RabbitQueue, "args": ['%queue%']},
            "handler.message":  {
                "module": MessageHandler,
                "args":   [
                    {$ref: 'logger'},
                    {$ref: 'client'},
                    {$ref: 'queue.rabbit'},
                    {$ref: 'listener.message'},
                    '%name%'
                ]
            },
            "helper.ignore":    {"module": IgnoreHelper, "args": ['%name%', {$ref: 'brain.redis'}, {$ref: 'logger'}]},
            "helper.throttle":  {"module": ThrottleHelper},
            "helper.channel":   {"module": ChannelHelper, "args": [{$ref: 'client'}]},
            "brain.memory":     {"module": MemoryBrain},
            "brain.redis":      {"module": RedisBrain, "args": ['%redis_url%']},
            "brain.mongo":      {"module": MongoBrain, "args": ['%mongo_url%']},
            "manager.message":  {"module": MessageManager, "args": [{$ref: 'client'}, '%prefix%']},
            "listener.message": {"module": MessageListener, "args": ['$container']}
        }
    };
};