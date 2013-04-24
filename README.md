# Cobalt #

Cobalt is a simple logger multiplexer that works with a JSON based format. You can instantiate it with a set of loggers or add them later (see API reference below). When logging anything, Cobalt will attempt to generate an Object that conforms to the Cobalt Log Format Definition (if required) and passes it to every logger it has by calling their `log` method.

Example of instantiating a cobalt logger:

```
this.logger = new Cobalt.Console({
  from : "Breezi Client",
  loggers : [ new Cobalt.Logger.JsConsole({
              formatter : Cobalt.Formatter.Token,
              formatterOpts : {
                formatString : "{{_from}}: {{message}}",
                ansiColor : true
              }
            })]
});
```

This code will create an instance with a JsConsole logger that uses the Token formatter (See loggers and formatters below).

Cobalt works in a browser or inside node, so feel free to use cobalt all over! (Also, see the socket logger below for info on connecting cobalt loggers)

## Quick API Reference ##

* **addLogger(logger)**: Adds a logger to the cobalt instance.
* **removeLogger(logger)**: Removes a logger from the cobalt instance.
* **buildLog(item, level=7)**: Generates a cobalt log object (it will do this automatically when you log anything)
* **buildSeparator**: Generates a cobalt log object that defines a separator
* **log, info, notice, warn, error**: Generates a log object with the appropriate severity level and sends it to all loggers.
* **separator()**: Generates a separator log object and sends it to all loggers.
* **space(lines)**: Logs an empty string `lines` times
* **indent()**: Increases the indent level globally.
* **indent(callback)**: Increases the indent level for anything logged from inside the callback.
* **outdent()/outdent(callback)**: Same as indent, but decreases indent level.
* **color()**: Changes the color globally. †
* **color(callback)**: Changes the color for anything logged from inside the callback. †
* **now()**: Returns the current time in microseconds, using performance.now() or process.hrtime() if available. If not, falls back to miliseconds.

† Cobalt doesn't really care about formatting or colors, but it allows you to set the `_color` property in the generated object. In the end, it's up to the formatter to decide if it will use this property. However, this maintains the old cobalt API and gives you flexibility in how you color your logs.


## Loggers ##

Cobalt doesn't depend on any particular logger, and the loggers it expects to receive is any object that responds to the log method. However, since it would pass a JSON object instead of a string, this may result in unexpected behavior for loggers that don't expect it. To ease the use of Cobalt with existing loggers, cobalt includes a couple of loggers that you can use out of the box.


### Cobalt.Logger.JsConsole ###

This logger communicates the Javascript console present in web browsers or node with cobalt. It uses the logLevel to trigger the appropriate method (e.g. info vs warn vs error). You can also initialize it with a formatter, to convert the log object to a string:

```
 new Cobalt.Logger.JsConsole({
     formatter : Cobalt.Formatter.Token,
     formatterOpts : {
         formatString : "[{{_timestamp}}] {{message}} (@{{_from}})"
     }
 }) 
```

What this does is: it will trigger the method `format` on `formatter` passing the `logObject` and `formatterOpts`. This means that a formatter is any object that responds to `format(logObject, formatterOpts)`. It expects a string to be returned.

### Cobalt.Logger.Socket ###

This logger sends the log object to a socket using Socket.IO. It does not format the output. To catch the log from the recipient, you have to listen for the `log` event, and from there you can pass it to another Cobalt instance or do whatever you want with it.

### More Loggers? ###

You can build your own logger easily for any method of transport you find necessary (e.g. mail, database, twitter, etc). Any object that responds to `#log(logObject)` is a valid logger:

```javascript
// A valid, very minimalistic logger
var simpleLogger = {
  log : function (logObject) {
    console.log(logObject.message);
  }
}

logger.addLogger(simpleLogger);
```

## Formatters ##

Cobalt itself makes no assumptions about the output of the logger and just passes the object to every logger it has. However, it is clear that loggers may want to manipulate this object. As shown in the JsConsole, a formatter should respond to the format method and receive a `logObject` and an `optsObject`. However, as this is not a core part of Cobalt, this is only a recommendation (as this is the way the included JsConsole logger does it) and it is up to the logger on how to transform the object it receives. Cobalt includes a very simple formatter that works well in conjuction with JsConsole.

### Cobalt.Formatter.Token ###

The Token formatter is a very simple formatter that uses a formatString to extract values from the log object and interpolate them in a string.

#### Options ####

* **formatString**: A string that defines the format of the output. It is a string with double curly braces denoting fields. For example: `"[{{_timestamp}}] {{message}} (@{{_from}})"` would attempt to extract the _timestamp, message and _from fields to create a string similar to this: `"[124896126491.123] Testing the logger (@Client Application)"`  (defaults to `"{{message}}"`)
* **ansiColor**: A boolean value, when `true` will output the string in ANSI color depending on the severity level (defaults to `false`)

### More Formatters? ###

As with loggers, cobalt itself does not worry about these things. However, if you wish to make a formatter that is exchangable with Token, you just need to create an object that responds to the `format(logObject, optionsObject)` method:

```javascript
// A valid, very minimalistic formatter
var simpleFormatter = {
  format : function (logObject, options) {
    if (options.showDate) {
      return "[" + Date(logObject._timeStamp) + "] " + logObject.message
    } else {
      return logObject.message;
    }
  }
}

logger.addLogger(new Cobalt.Logger.JsConsole({
  formatter: simpleFormatter,
  formatterOpts : {
    showDate : true
  }
}));
```

## The Cobalt Log Format ##

The Cobalt Log (CoLog) format is a JSON based log format used with cobalt. It is partly inspired in Greylog's GELF format, but with very notorious differences. The CoLog requires a header with certain fields that allow cobalt and its pieces to handle it. All header fields are prefixed with an underscore. Other than those fields, you can put whatever you want in the object; It's up to the loggers to make sense of the structure and display it in a way that makes sense.

You can attempt to build this structure on your own, or let cobalt build it for you. Any object you pass for logging will be converted.

### Required Fields ###

* **_version** : The version of cobalt this is designed to work with
* **_timestamp** : A timestamp in microseconds.
* **_cobaltLog** [true] : Cobalt will check for the _cobaltLog to decide if transformation will happen or not.

### Optional Fields ###

* **_from**: The sender of the log (Defaults to Generic Cobalt Logger)
* **_level**: The level of the log (Defaults to 7)
* **_levelString**: The string corresponding to the log level (e.g. 7 -> DEBUG, 3 -> ERROR, 0 -> CRIT)
* **_indentLevel**: The indent level of the log
* **_color**: The color of the log
* **_separator**: If true, indicates that this is a separator and holds no valuable information.
