var bindEvents = function (socket, logger) {
    socket.on('log', function (logObject) {
      logger.log(logObject);
    });
}

exports.bindEvents = bindEvents;
