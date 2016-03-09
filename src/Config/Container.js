const crate            = require('crate-js'),
      ContainerBuilder = crate.ContainerBuilder,
      JsonLoader       = crate.JsonLoader;

module.exports = function (Bot) {
    var builder = new ContainerBuilder(),
        loader  = new JsonLoader();

    loader.addFile({parameters: require('./parameters')(Bot)});
    loader.addFile({services: require('./core')});
    loader.addFile({services: require('./brains')});
    loader.addFile({services: require('./handlers')});
    loader.addFile({services: require('./helpers')});
    loader.addFile({services: require('./listeners')});
    loader.addFile({services: require('./managers')});
    loader.addFile({services: require('./repositories')});

    loader.addFile({services: require('./extra')});

    builder.addLoader(loader);

    return {builder: builder, loader: loader};
};
