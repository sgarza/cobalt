(function (global) {
  var Module, Class;

  // Load up dependencies
  if (typeof require === 'function') {
    var Ne = require('neon');
    var ioClient = require('socket.io-client');
    Module = Ne.Module;
    Class = Ne.Class;
  } else {
    Module = global.Module;
    Class = global.Class;
  }

  var Cobalt = {};
  Module(Cobalt, 'Logger')({});

  Cobalt.Logger.Socket = Class(Cobalt.Logger, 'Socket')({
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

  if (Cobalt.Logger.Socket.__objectSpy) {
    Cobalt.Logger.Socket.__objectSpy.destroy();
  }

  if (typeof require === 'function') {
    global.Socket = Cobalt.Logger.Socket;
  } else {
    global.Cobalt.Logger.Socket = Cobalt.Logger.Socket;
  }
}(typeof window !== 'undefined' ? window : (typeof exports !== 'undefined' ? exports : self)));
