var fs = require('fs');

Class(Cobalt.Logger, 'File')({
  prototype : {
    file : null,
    formatterOpts : {},

    init : function (config) {
      if (config) {
        for (property in config) {
          this[property] = config[property];
        }
      }

      this._stream = fs.createWriteStream(this.file);
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

      for (i = 0; i < message.length; i++) {
        this._stream.write(message[i] + '\n');
      }
    },

    format : function (logObject) {
      if (this.formatter) {
        return this.formatter.format(logObject, this.formatterOpts);
      }

      return logObject.message;
    }
  }
});
