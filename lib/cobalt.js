(function (global) {
  var Module, Class;

  // Load up dependencies
  if (typeof require === 'function') {
    var Ne = require('neon');
    Module = Ne.Module;
    Class = Ne.Class;
    var Microtime = require('microtime');
  } else {
    Module = global.Module;
    Class = global.Class;
  }

  var Cobalt = {};
  Module(Cobalt, 'Logger')({});
  Module(Cobalt, 'Formatter')({});

  // Load up loggers + formatters
  if (typeof require === 'function') {
    // Formatters
    Cobalt.Formatter.Token = require('./formatters/token.js').Token;

    // Loggers
    Cobalt.Logger.JsConsole = require('./loggers/console.js').JsConsole;
    Cobalt.Logger.Socket = require('./loggers/socket.js').Socket;
  }

  Cobalt.now = function () {
    if (typeof performance !== 'undefined' && performance.timing) {
      return performance.timing.navigationStart + performance.now();
    }

    if (typeof Microtime !== 'undefined') {
      return Microtime.nowDouble() * 1000;
    }

    return Date.now();
  }

  // Stringify with circular dereference.
  Cobalt.stringify = function (object) {
    var cache = [], stringified;
    stringified = JSON.stringify(object, function (key, value) {
      if (typeof value === 'object' && value !== null) {
        if (cache.indexOf(value) !== -1) {
          return "[Circular]";
        }
        cache.push(value);
      }
      return value;
    });
    cache = null;

    return stringified;
  }

  Cobalt.Console = Class(Cobalt, 'Console')({
    prototype : {
      from : "Generic Cobalt Logger",
      version : "0.1.0",
      currentIndent : 0,
      indentSize : 2,
      loggers : [],
      separatorLength : 120,
      currentColor : "black",

      // Initialize instance of cobalt console
      // and extend configuration.
      init : function (config) {
        var co = this,
            property;

        if (config) {
          for (property in config) {
            co[property] = config[property];
          }
        }
      },

      addLogger : function (logger) {
        this.loggers.push(logger);
      },

      removeLogger : function (logger) {
        var index;

        index = this.loggers.indexOf(logger);
        this.loggers.splice(index, 1);
      },

      // Builds a Cobalt Log Object
      buildLog : function (item, level) {
        var co = this, oldItem, logObject = {};

        if (!item._cobaltLog) {
          logObject.message = item;
          logObject._cobaltLog = true;
          logObject._from = co.from;
          logObject._level = item._level || level || 7;
          logObject._levelString = co._levelString(item._level);
          logObject._version = co.version;
          logObject._timestamp = co.now();
          logObject._indentLevel = co.currentIndent;
          logObject._color = co.currentColor;
          return logObject;
        }

        return item;
      },

      buildSeparator : function (type) {
        var co = this;
        return {
          _cobaltLog : true,
          _separator : true,
          _version : co.version,
          _timestamp : co.now(),
          _separatorType : type,
          _indentLevel : co.currentIndent,
          _color : co.currentColor
        }
      },

      _log : function (severity) {
        var co = this,
            logString,
            logObjectArray = [],
            i, j;

        for (i = 1; i < arguments.length; i++) {
          if (typeof arguments[i] === 'undefined') {
            logObjectArray.push(co.buildLog("undefined", severity));
          } else {
            logObjectArray.push(co.buildLog(arguments[i], severity));
          }
        }

        for (j = 0; j < co.loggers.length; j++) {
          co.loggers[j].log.apply(co.loggers[j], logObjectArray);
        }
      },

      log : function () {
        this._log.apply(this, [7].concat([].splice.call(arguments, 0)));
      },

      info : function () {
        this._log.apply(this, [6].concat([].splice.call(arguments, 0)));
      },

      notice : function () {
        this._log.apply(this, [5].concat([].splice.call(arguments, 0)));
      },

      warn : function () {
        this._log.apply(this, [4].concat([].splice.call(arguments, 0)));
      },

      error : function () {
        this._log.apply(this, [3].concat([].splice.call(arguments, 0)));
      },

      separator : function (type) {
        var co = this;

        co._log(7, co.buildSeparator(type));
      },

      space : function (lines) {
        var co = this,
            i;

        if (typeof lines === "undefined") {
          lines = 1;
        }

        for (i = 0; i < lines; i++) {
          co.log(' ');
        }

        return co;
      },

      indent : function (callback) {
        var co = this;

        if (typeof callback === "function") {
          co.currentIndent = co.currentIndent + co.indentSize;
          callback();
          co.currentIndent = co.currentIndent - co.indentSize;
        } else {
          co.currentIndent = co.currentIndent + co.indentSize;
        }

        return co;
      },

      outdent : function (callback) {
        var co = this;

        if (typeof callback === "function") {
          co.currentIndent = co.currentIndent - co.indentSize;
          if (co.currentIndent < 0) {
            co.currentIndent = 0;
          }

          callback();

          co.currentIndent = co.currentIndent + co.indentSize;
        } else {
          co.currentIndent = co.currentIndent - co.indentSize;
          if (co.currentIndent < 0) {
            co.currentIndent = 0;
          }
        }

        return co;
      },

      color : function (color, callback) {
        var co = this,
            oldColor = co.currentColor;

        if (typeof callback === "function") {
          co.currentColor = color;
          callback();
          co.currentColor = oldColor;
        } else {
          co.currentColor = color;
        }

        return co;
      },

      // Returns the current time in microseconds.
      now : function () {
        if (typeof performance !== 'undefined' && performance.timing) {
          return performance.timing.navigationStart + performance.now();
        }

        if (typeof Microtime !== 'undefined') {
          return Microtime.nowDouble() * 1000;
        }

        return Date.now();
      },

      _levelString : function (level) {
        switch(level) {
          case 0:
            return "PANIC";
            break;
          case 1:
            return "ALERT"
            break;
          case 2:
            return "CRIT"
            break;
          case 3:
            return "ERROR"
            break;
          case 4:
            return "WARN"
            break;
          case 5:
            return "NOTICE"
            break;
          case 6:
            return "INFO"
            break;
          case 7:
            return "DEBUG"
            break;
        }
      }
    }
  });

  if (Cobalt.Console.__objectSpy) {
    Cobalt.Console.__objectSpy.destroy();
  }

  if (typeof require === 'function') {
    global.Formatter = Cobalt.Formatter;
    global.Logger = Cobalt.Logger;
    global.Console = Cobalt.Console;
    global.now = Cobalt.now;
    global.stringify = Cobalt.stringify;
  } else {
    global.Cobalt = Cobalt;
  }

}(typeof window !== 'undefined' ? window : (typeof module.exports !== 'undefined' ? module.exports : self)));
