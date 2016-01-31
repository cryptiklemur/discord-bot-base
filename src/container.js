const EventEmitter    = require('events');
const winston         = require('winston');
const Discord         = require('discord.js');
const Logger          = require('./Logger');
const RedisBrain      = require('./Brain/RedisBrain');
const MongoBrain      = require('./Brain/MongoBrain');
const MessageListener = require('./Listener/MessageListener');
const ThrottleHelper  = require('./Helper/ThrottleHelper');
const MessageManager  = require('./Manager/MessageManager');

module.exports = (Bot) => {
    return {
        "parameters": {
            "dev":       Bot.isEnv('dev'),
            "prefix":    Bot.options.prefix,
            "login":     {
                "email":    Bot.options.email,
                "password": Bot.options.password
            },
            "admin_id":  Bot.options.admin_id,
            "redis_url": undefined,
            "mongo_url": undefined
        },
        "services":   {
            "dispatcher":       {"module": EventEmitter},
            "logger":           {"module": Logger},
            "client":           {"module": Discord.Client},
            "helper.throttle":  {"module": ThrottleHelper},
            "brain.redis":      {"module": RedisBrain, "args": ['%redis_url%']},
            "brain.mongo":      {"module": MongoBrain, "args": ['%mongo_url%']},
            "manager.message":  {"module": MessageManager, "args": [{$ref: 'client'}, '%prefix%']},
            "listener.message": {"module": MessageListener, "args": ['$container']}
        }
    };
};