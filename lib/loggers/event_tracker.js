(function (global) {

  // Load up dependencies
  if (typeof require === 'function') {
    var Ne = require('neon');
    Module = Ne.Module;
    Class = Ne.Class;
  } else {
    Module = global.Module;
    Class = global.Class;
  }

  var Cobalt = {};
  Module(Cobalt, 'Logger')({});

  // TODO: Include CES
  Cobalt.Logger.EventTracker = Class(Cobalt.Logger, 'EventTracker')({
    enabled : true,
    prototype : {
      formatter : null,
      metriclientUrl : "http://54.235.163.0/api/v1",
      _eventPath : "events",
      _errorPath : "errors",
      _totalErrors : 0,

      // time tracking
      _timeTotal : 0,
      _startTime : 0,

      //Debouncing reference
      _prevEvent : {},

      init : function (config) {
        var logger = this,
            property;

        if (config) {
          for (property in config) {
            logger[property] = config[property];
          }
        }

        if (!logger.formatter) {
          logger.formatter = global.Cobalt.Formatter.EventTracker;
        }

        logger._setupEvents();
      },

      // Main log entry, formats and sends it to metriclient.
      log : function (logObject) {
        var formattedObject;

        if (!this._canSend()) {
          return;
        }

        formattedObject = this.format(logObject);

        if (formattedObject) {
          this._postEvent(formattedObject);
        }
      },

      // Format (Default is EventTracker formatter, check that to see what's
      // going on)
      format : function (logObject) {
        return this.formatter.format(logObject);
      },

      // Check if we meet the conditions to send it to metriclient
      _canSend : function (logObject) {
//        if (!this.constructor.enabled || environment !== 'ek_production' || installation.type === 'Empowerkit') {
//          return false;
//        }
        return true;
      },

      // Setup bindings to external events (upgradeModal events & unload)
      _setupEvents : function () {
        var logger = this,
            startEvent = 'Breezi:track:start',
            endEvent = 'Breezi:track:finish';

        logger._startTime = global.Cobalt.now();

        logger.log({event : {type : startEvent}});

        logger._justCallOnce = false;

        global.addEventListener( 'beforeunload', function (ev) {
          if(logger._justCallOnce){
              return;
          }
          logger._justCallOnce = true;

          //total time in editor
          logger._timeTotal = (global.Cobalt.now() - logger._startTime);

          //report session end
          var eventToSend = {
            site_id : (typeof Client !== 'undefined') ? Client.pageInfo.site.id : 'N/A',
            event_type : endEvent,
            data : {
              timeTotal : logger._timeTotal
            },
            _type : '_event'
          };

          logger._postEvent(eventToSend);
        });

        global.addEventListener( 'message', function (ev) {
          var frameEvents = [
              'Breezi:upgradeModal:loadView:welcome',
              'Breezi:upgradeModal:loadView:system_validation_errors',
              'Breezi:upgradeModal:loadView:credit_card_changed',
              'Breezi:upgradeModal:loadView:subscription_success',
              'Breezi:upgradeModal:loadView:subscription_success_with_coupon',
              'Breezi:upgradeModal:loadView:plan_changed',
              'Breezi:upgradeModal:loadView:billing_errors'
          ];

          if(frameEvents.indexOf( ev.data ) !== -1){
              logger.log( { event : { type: ev.data } } );
          }
        }, false);
      },

      // Post event to metriclient
      _postEvent : function (eventToSend) {
        var logger = this, url;

        // Decide where to send it
        if (eventToSend._type === 'event') {
          url = logger.metriclientUrl + "/" + logger._eventPath;
        }
        if (eventToSend._type === 'error') {
          url = logger.metriclientUrl + "/" + logger._errorPath;
        }
        delete eventToSend._type;

        // Check debouncing
        if (logger._prevEvent === eventToSend) {
          clearTimeout(logger._senderTimeout);
        } else {
          logger._prevEvent = eventToSend;
        }

        logger._senderTimeout = setTimeout(function () {
            console.log("Should send ", eventToSend, "to", url);
//          $.ajax({
//              url : url,
//              type : 'POST',
//              data : {
//                  event : JSON.stringify(eventToSend)
//              },
//              error : function (err) {
//                  logger.constructor.enabled = false; //no more data reports
//              },
//              success : function() {
//                  // Dispatch eventSent so the circle and such can catch 'em all
//                  logger.constructor.dispatch('eventSent');
//              }
//          });
        }, 100);
      }
    }
  });

  // Clear the Lithium spy, avoid infinite recursion
  if (Cobalt.Logger.EventTracker.__objectSpy) {
    Cobalt.Logger.EventTracker.__objectSpy.destroy();
  }

  if (typeof require === 'function') {
    global.EventTracker = Cobalt.Logger.EventTracker;
  } else {
    global.Cobalt.Logger.EventTracker = Cobalt.Logger.EventTracker;
  }
}(typeof window !== 'undefined' ? window : (typeof exports !== 'undefined' ? exports : self)));
