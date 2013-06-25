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
      console : null,
      formatterOpts : {},

      init : function (config) {
        var logger = this,
            property;

        if (config) {
          for (property in config) {
            logger[property] = config[property];
          }
        }

        if (!logger.console) {
          logger.console = console;
        }
      },

      log : function () {
        var i, message = [], severity;

        for (i = 0; i < arguments.length; i++) {
          // We're not formatting objects for now.

          if (!arguments[i].__skipConsole && !arguments[i].message.__skipConsole) {
            if (typeof arguments[i].message === 'object') {
              message.push(arguments[i].message);
            } else {
              message.push(this.format(arguments[i]));
            }
            if (!severity) {
              severity = arguments[i]._level
            }
          }
        }

        switch (severity){
          case 0:
          case 1:
          case 2:
          case 3:
            this.console.error.apply(this.console, message);
            break;
          case 4:
            this.console.warn.apply(this.console, message);
            break;
          case 5:
          case 6:
            this.console.info.apply(this.console, message);
            break;
          case 7:
          default:
            this.console.log.apply(this.console, message);
            break;
        }
      },

      format : function (logObject) {
        // Usually what you want to do here is format. Preferably using
        // someone inside Cobalt.Formatter
        if (this.formatter) {
          return this.formatter.format(logObject, this.formatterOpts);
        }

        return logObject.message;
      }
    }
  });

  if (Cobalt.Logger.JsConsole.__objectSpy) {
    Cobalt.Logger.JsConsole.__objectSpy.destroy();
  }

  if (typeof require === 'function') {
    global.JsConsole = Cobalt.Logger.JsConsole;
  } else {
    global.Cobalt.Logger.JsConsole = Cobalt.Logger.JsConsole;
  }
}(typeof window !== 'undefined' ? window : (typeof exports !== 'undefined' ? exports : self)));
