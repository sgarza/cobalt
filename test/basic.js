if (typeof require === "function") {
    require("cobalt-log");
}

var co = new Cobalt.Console({
    loggers : [
        new Cobalt.Logger.JsConsole({
            formatter     : Cobalt.Formatter.Token,
            formatterOpts :  {
              formatString : "[{{_level}}] {{message}} {{customParam}}"
            }
        })
    ]
})

// TODO: Do this whole thing with tellurium.

co.log("Log - Normal");
co.debug("Warn - Normal");
co.info("Info - Normal");
co.notice("Notice - Normal");
co.warn("Warn - Normal");
co.error("Error - Normal");

var logObject = co.extendLog({
    message : "Extended Log Object",
    customParam : "<3"
});

co.log(logObject);
co.debug(logObject);
co.info(logObject);
co.notice(logObject);
co.warn(logObject);
co.error(logObject);
