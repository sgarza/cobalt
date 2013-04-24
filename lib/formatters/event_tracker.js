(function (global) {
  var Module;

  // Load up dependencies
  if (typeof require === 'function') {
    var Ne = require('neon');
    Module = Ne.Module;
  } else {
    Module = global.Module;
  }

  var Cobalt = {};
  Module(Cobalt, 'Formatter')({});

  Cobalt.Formatter.EventTracker = Module(Cobalt.Formatter, 'EventTracker')({

    // Main formatter entry point, validate type and send to proper format
    // method
    format : function (logObject) {
      switch(this._validateFormat(logObject)){
        case 'error':
          return this._formatError(logObject);
        break;
        case 'event':
          logObject._type = 'event';
          return this._formatEvent(logObject);
        break;
      }
      return undefined;
    },

    // Format error
    _formatError : function (logObject) {
      var errorObject;

      errorObject = logObject.error;
      errorObject._type = 'error';

      if (typeof Client !== 'undefined') {
          errorObject.site_id = Client.pageInfo.site.id;
      }else if (global.data && global.data.site && global.data.site.id) {
          errorObject.site_id = global.data.site.id;
      }
      errorObject.scoped_class_name = errorObject.meta.scopedClassName;
      errorObject.user_agent = global.navigator.userAgent;

      return errorObject;
    },

    // Format the event
    _formatEvent : function (logObject) {
      var eventToSend;

      eventToSend = this._createStructure(logObject);

      return eventToSend;
    },

    // Check for the fingerprint of an event or an error
    _validateFormat : function (logObject) {
      if (typeof logObject === 'object'){
        // Check for error object (must have meta)
        if (logObject.hasOwnProperty('error')) {
          if (logObject.error.hasOwnProperty('meta')) {
            return 'error';
          }
        // Check for event object (must have type)
        } else if (logObject.hasOwnProperty('event')) {
          if (logObject.event.hasOwnProperty('type')) {
            return 'event';
          }
        }
      }
      return undefined;
    },

    // This was ported as-is, but It's weird that we're doing lithium logic in
    // here. TODO: Please move this elsewhere. - ben
    _pushToLithium : function (object) {
      var lithiumEvent;

      if (typeof Li !== 'undefined') {
        if (Li.stack) {
          lithiumEvent = {
            type : object.event.type,
            instanceName : (object.event.data) ? (object.event.data.name || object.event.data.id || '---') : '---',
            time : global.Cobalt.now()
          };

          Li.events.push(lithiumEvent);
          Li.stack.push(lithiumEvent);

          // Another note: There was another push to Li.stack that checked if it
          // was typeof === array. Which will never happen since array is typeof
          // Object. But I could be wrong. So... yeah. That.

          if (Li.events.length > 20) {
            Li.stack.shift();
          }
        }
      }
    },

    // Create the main structure, also push to lithium
    _createStructure : function (logObject) {
      var event = {};

      this._pushToLithium(logObject);

      event.site_id = global.Client ? Client.pageInfo.site.id : 'client not found';
      event.event_type = logObject.event.type;

      event.data = logObject.event.data || {};
      event.data = this._process(event.data);
      event.data.user_time_stamp = global.Cobalt.now();

      event = this._addSiteData(event);
      event = this._addTrackingData(event);

      event._type = 'event';

      return event;
    },

    // Add required data from siteInfo
    _addSiteData : function (event) {
      if (typeof siteInfo !== 'undefined') {
        event.data.trial_period_days_left    = siteInfo.trialPeriodDaysLeft;
        event.data.billing_status            = siteInfo.billingStatus;
        event.data.is_admin_on_trial         = siteInfo.isAdminOnTrial;
        event.data.is_new_site               = siteInfo.isNewSite;
        event.data.is_for_play               = siteInfo.forPlay;
        event.data.page_path                 = siteInfo.currentPagePath;
      }

      return event;
    },

    // Add required tracking variables for ad campaigns and such
    _addTrackingData : function (event) {
      if (typeof siteInfo !== 'undefined' && siteInfo.trackingVariables) {
        event.data.initial_referring_domain  = siteInfo.trackingVariables.initial_referring_domain;
        event.data.referrer                  = siteInfo.trackingVariables.referrer;
        event.data.search_keyword            = siteInfo.trackingVariables.search_keyword;
        event.data.utm_campaign              = siteInfo.trackingVariables.utm_campaign;
        event.data.utm_content               = siteInfo.trackingVariables.utm_content;
        event.data.utm_medium                = siteInfo.trackingVariables.utm_medium;
        event.data.utm_source                = siteInfo.trackingVariables.utm_source;
        event.data.utm_term                  = siteInfo.trackingVariables.utm_term;
      }

      return event;
    },

    // Send data through processors to extract valuable metadata
    _process : function (data) {
      if( typeof data !== 'undefined' && typeof data.constructor !== 'undefined' && typeof data.constructor.className !== 'undefined' ){
        switch( data.constructor.className ){
          case 'App':
            return { meta: this._processApp(data) };

          case 'Entry':
            return { meta: this._processEntry(data) };

          case 'Dot':
            return { meta: this._processDot(data) };

          case 'SiteSkin':
            return { meta: this._processSiteSkin(data) };

          case 'RepositorySkin':
            return { meta: this._processRepositorySkin(data) };

          default :
            //do nothing and create an snapshot for the object
            var snapshot = {};

            $.each(data, function(i, el){
              if(typeof el === 'string' || typeof el === 'number' || typeof el === 'boolean'){
                snapshot[i] = el;
              }
            });

            return { meta: { status: 'No processor for '+data.constructor.className, snapshot: snapshot } };
        }

      }else{
        // No process for you
        return { meta: data };
      }
    },

    _processApp : function (data) {
    var eventData = {
      displayName       : data.record.displayName,
      repositoryAppId   : data.record.repositoryApp().id,
      repositoryAppName : data.record.repositoryApp().name
    };

    return { app: eventData };
    },

    _processEntry : function (data) {
      //get app data
      var app = this.processApp( Client.page['app_' + data.appId] );

      var entry = {
        id : data.id,
        fieldValues : {}
      };

      //parse and save fieldvalues
      $.each(data.fieldValues, function(i, field){
        entry.fieldValues[field.fieldName] = field.value;
      });

      return {app: app, entry : entry};
    },

    _processDot : function (data) {
      var target = { type: data.ruleTree.type };

      switch (target.type){
        case 'app' :
          target.app = this.processApp( Client.page['app_'+data.ruleTree.id.replace('app_style_','')] ).app;
          break;
      }

      var dot = {
        type: data.type,
        name: data.name
      };

      return {target: target, dot : dot};
    },

    _processSiteSkin : function (data) {
      return { siteSkin : {
                 skinName: skinData.name,
                 skinId: skinData.id
               }
             };
    },

    _processRepositorySkin : function (data) {
      var skin = {
        id            : data.id,
        name          : data.name,
        userName      : data.userName,
        acquireMode   : data.acquireMode,
        amountInCents : data.amountInCents,
        featured      : data.featured,
        installCount  : data.installCount,
        popular       : data.popular
      };

      return { repositorySkin: skin };
    }
  });

  if (Cobalt.Formatter.EventTracker.__objectSpy) {
    Cobalt.Formatter.EventTracker.__objectSpy.destroy();
  }

  if (typeof require === 'function') {
    global.EventTracker = Cobalt.Formatter.EventTracker;
  } else {
    global.Cobalt.Formatter.EventTracker = Cobalt.Formatter.EventTracker;
  }
}(typeof window !== 'undefined' ? window : (typeof exports !== 'undefined' ? exports : self)));
