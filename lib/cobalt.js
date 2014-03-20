// Load up dependencies
if (typeof require === 'function') {
  require('neon');
  var Microtime = require('microtime');
}

Cobalt = Module("Cobalt");
Module(Cobalt, 'Logger')({});
Module(Cobalt, 'Formatter')({});

// Load up loggers + formatters
if (typeof require === 'function') {
  // Formatters
  require('./formatters/token.js');

  // Loggers
  require('./loggers/console.js');
  require('./loggers/socket.js');
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

Class(Cobalt, 'Console')({
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

      if (typeof item === "undefined" || item === null || !item._cobaltLog) {
        logObject.message = item;
        logObject._cobaltLog = true;
        logObject._from = co.from;
        logObject._level = level || 6;
        logObject._levelString = co._levelString(logObject._level);
        logObject._version = co.version;
        logObject._timestamp = co.now();
        logObject._indentLevel = co.currentIndent;
        logObject._color = co.currentColor;
        logObject._separator = false;
        return logObject;
      }

      if (item._cobaltLog) {
        item._level = level || item._level || 6;
        item._levelString = co._levelString(item._level);
      }

      return item;
    },

    extendLog : function (extendingObject) {
      var co = this, logObject,
          property;

      logObject = co.buildLog(undefined, 6);
      extendingObject = extendingObject || {};

      for (property in extendingObject) {
        if (extendingObject.hasOwnProperty(property)) {
          logObject[property] = extendingObject[property];
        }
      }

      return logObject;
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
      this._log.apply(this, [6].concat(Array.prototype.slice.call(arguments)));
    },

    debug : function () {
      this._log.apply(this, [7].concat(Array.prototype.slice.call(arguments)));
    },

    info : function () {
      this._log.apply(this, [6].concat(Array.prototype.slice.call(arguments)));
    },

    notice : function () {
      this._log.apply(this, [5].concat(Array.prototype.slice.call(arguments)));
    },

    warn : function () {
      this._log.apply(this, [4].concat(Array.prototype.slice.call(arguments)));
    },

    error : function () {
      this._log.apply(this, [3].concat(Array.prototype.slice.call(arguments)));
    },

    dir : function () {
    },

    time : function () {
    },

    timeEnd : function () {
    },

    groupCollapsed : function () {
    },

    groupEnd : function () {
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
