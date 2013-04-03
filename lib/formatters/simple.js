(function (global) {
  var Module;

  // Load up dependencies
  if (typeof require === 'function') {
    var Ne = require('neon');
    Module = Ne.Module;
  } else {
    Module = global.Module;
  }

  var Cobalt = {};
  Module(Cobalt, 'Formatter')({});

  Cobalt.Formatter.Simple = Module(Cobalt.Formatter, 'Simple')({
    format : function (logObject, opts){
      var indent;

      indent = Array(logObject._indentLevel + 1).join(' ');

      return indent + logObject.message;
    }
  });

  if (typeof require === 'function') {
    global.Simple = Cobalt.Formatter.Simple;
  } else {
    global.Cobalt.Formatter.Simple = Cobalt.Formatter.Simple;
  }
}(typeof window !== 'undefined' ? window : (typeof exports !== 'undefined' ? exports : self)));
