(function (global) {
  var Module;

  // Load up dependencies
  if (typeof require === 'function') {
    require('colors');
    var Ne = require('neon');
    Module = Ne.Module;
  } else {
    Module = global.Module;
  }

  var Cobalt = {};
  Module(Cobalt, 'Formatter')({});

  Cobalt.Formatter.Ansi = Module(Cobalt.Formatter, 'Ansi')({
    format : function (logObject, opts){
      var indent,
          message;

      indent = Array(logObject._indentLevel + 1).join(' ');

      message = indent + logObject.message;

      switch(logObject._level) {
        case 0:
        case 1:
        case 2:
        case 3:
          return message.red;
        case 4:
          return message.yellow;
        case 5:
        case 6:
          return message.blue;
        default:
          return message;
      }
    }
  });

  if (typeof require === 'function') {
    global.Ansi = Cobalt.Formatter.Ansi;
  } else {
    global.Cobalt.Formatter.Ansi = Cobalt.Formatter.Ansi;
  }
}(typeof window !== 'undefined' ? window : (typeof exports !== 'undefined' ? exports : self)));
