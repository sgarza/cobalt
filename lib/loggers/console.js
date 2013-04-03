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

  Cobalt.Logger.JsConsole = Class(Cobalt.Logger, 'JsConsole')({
    prototype : {
      console : console,
      formatterOpts : {},

      init : function (config) {
        var logger = this,
            property;

        if (config) {
          for (property in config) {
            logger[property] = config[property];
          }
        }
      },

      log : function (logObject) {
        var message;

        message = this.format(logObject);

        switch (logObject._level){
          case 0:
          case 1:
          case 2:
          case 3:
            this.console.error(message);
            break;
          case 4:
            this.console.warn(message);
            break;
          case 5:
          case 6:
            this.console.info(message);
            break;
          case 7:
          default:
            this.console.log(message);
            break;
        }
      },

      format : function (logObject) {
        // Usually what you want to do here is format. Preferably using
        // someone inside Cobalt.Formatter
        if (this.formatter) {
          return this.formatter.format(logObject, this.formatterOpts);
        }

        return logObject;
      }
    }
  });

  if (typeof require === 'function') {
    global.JsConsole = Cobalt.Logger.JsConsole;
  } else {
    global.Cobalt.Logger.JsConsole = Cobalt.Logger.JsConsole;
  }
}(typeof window !== 'undefined' ? window : (typeof exports !== 'undefined' ? exports : self)));
