module.exports = (Bot) => {
    return {
        env:            Bot.env,
        dev:            Bot.env === 'dev',
        debug:          Bot.debug,
        prefix:         Bot.options.prefix,
        name:           Bot.options.name,
        storage:        Bot.options.storage,
        login:          {
            token:    Bot.options.token,
            email:    Bot.options.email,
            password: Bot.options.password
        },
        status:         Bot.options.status,
        admin_id:       Bot.options.admin_id,
        commands:       Bot.options.commands,
        log_dir:        Bot.options.log_dir || null,
        redis_url:      Bot.options.redis_url || "",
        mongo_url:      Bot.options.mongo_url || "",
        mysql_url:      Bot.options.mysql_url || "",
        queue:          Bot.options.queue || {},
        loader_timeout: Bot.options.loaderTimeout,
        client_args:    {forceFetchUsers: true}
    }
};
