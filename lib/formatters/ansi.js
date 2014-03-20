if (typeof require === 'function') {
    require('colors');
}

Module(Cobalt.Formatter, 'Ansi')({
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
