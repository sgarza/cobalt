if (typeof require === 'function') {
  var ioClient = require('socket.io-client');
}

Class(Cobalt.Logger, 'Socket')({
  prototype : {
    serverUrl : '/',

    init : function (config) {
      var logger = this;

      if (config) {
        for (property in config) {
          logger[property] = config[property];
        }
      }

      if (!logger.socketIo) {
        logger.socketIo = ioClient;
      }

      logger._socket = logger.socketIo.connect(logger.serverUrl);
    },

    log : function () {
      var i, messageArray = [];

      for (i = 0; i < arguments.length; i++) {
        messageArray.push(arguments[i]);
      }

      if (this._socket) {
        this._socket.emit('log', messageArray);
      }
    }
  }
});
