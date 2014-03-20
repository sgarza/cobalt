Module(Cobalt.Formatter, 'Token')({
  formatString : "{{message}}",
  replaceRule : /{{(.*?)}}/g,
  separatorLength : 60,
  separatorType : "-",
  format : function (logObject, opts){
    var indent, indentSize,
        separatorLength, separatorType,
        output;
    indentSize = logObject._indentLevel || 0;

    indent = Array(indentSize + 1).join(' ');

    if (logObject._separator) {
      separatorLength = logObject._separatorLength || this.separatorLength;
      separatorType = logObject._separatorType || this.separatorType;
      output = indent + Array(separatorLength - indentSize + 1).join(separatorType);
    } else {
      output = indent + this.parseFormatString(logObject, opts.formatString);
    }

    if (opts.ansiColor) {
      output = this.colorize(logObject._level, output);
    }

    return output;
  },

  parseFormatString : function (logObject, formatString) {
    var resultString = '';
    if (typeof formatString === 'undefined') {
      formatString = this.formatString;
    }

    resultString = formatString.replace(this.replaceRule, function(match, paren){
      return logObject[paren] || "-";
    });

    return resultString;
  },

  colorize : function (level, message) {
    switch(level) {
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
