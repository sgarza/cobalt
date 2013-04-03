(function (global) {
  var Module, Class;

  // Load up dependencies
  if (typeof require === 'function') {
    var Ne = require('neon');
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

      init : function () {
        this._socket = io.connect(this.serverUrl);
      },

      log : function (logObject) {
        this._socket.emit('log', logObject);
      }
    }
  });

  if (typeof require === 'function') {
    global.Socket = Cobalt.Logger.Socket;
  } else {
    global.Cobalt.Logger.Socket = Cobalt.Logger.Socket;
  }
}(typeof window !== 'undefined' ? window : (typeof exports !== 'undefined' ? exports : self)));
