var bindEvents = function (socket, logger) {
    socket.on('log', function (logArgs) {
      logger.log.apply(logger, logArgs);
    });
}

exports.bindEvents = bindEvents;
