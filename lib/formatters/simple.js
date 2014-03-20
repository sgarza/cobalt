Module(Cobalt.Formatter, 'Simple')({
    format : function (logObject, opts){
        var indent;

        indent = Array(logObject._indentLevel + 1).join(' ');

        return indent + logObject.message;
    }
});
