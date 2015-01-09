Module(Cobalt.Formatter, 'Simple')({
    format : function (logObject, opts){
        var indent, date;

        indent = Array(logObject._indentLevel + 1).join(' ');

        date = new Date(logObject._timestamp);

        return indent + '[' + date.toISOString() + '][' + logObject._levelString + '] ' + logObject._from + ' : ' + logObject.message;
    }
});
