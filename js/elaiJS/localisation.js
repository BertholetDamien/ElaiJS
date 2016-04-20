define([  "elaiJS/configuration", "elaiJS/webservice", "elaiJS/helper",
          "elaiJS/propertiesManagerFactory", "elaiJS/binder"],
          function(config, webservice, helper, manager, binder) {
	'use strict';
	
  var propertiesManager = manager.build({
    name: "Localisation",
    getDefaultKey: function() {
      return self.findValidLocalisation(config.elaiJS.defaultLocalisation);
    },
    loadProperties: function(n, cb, errcb) {
      webservice.loadLocalisationFile(n, cb, errcb);
    },
    findFirstKey: findFirstKey
  });
  
	var self = {};
	binder.addFunctions(self);
	var EVENT = {localisationChanged: "localisationChanged"};
	self.EVENT = EVENT;
	
  self.initialize = propertiesManager.initialize;
  
	self.getLocalisation = propertiesManager.getCurrentKey;
	
  function findFirstKey() {
    var loc;
    if(config.elaiJS.localisationStorageKey)
      loc = localStorage.get(config.elaiJS.localisationStorageKey);

    if(!loc && config.elaiJS.autoFindLocalisation)
      loc = window.navigator.userLanguage || window.navigator.language;
    
    return self.findValidLocalisation(loc);
  }
  
	self.get = function get(keyPropertie, loc) {
    return propertiesManager.get(keyPropertie, self.findValidLocalisation(loc));
	};
	
	self.setLocalisation = function setLocalisation(rawLocalisation, callback) {
    if(config.elaiJS.localisationStorageKey)
      localStorage.set(config.elaiJS.localisationStorageKey, rawLocalisation);
    
	  var fireCb = binder.buildFireCallBack(this, EVENT.localisationChanged, callback);
    propertiesManager.setKey(self.findValidLocalisation(rawLocalisation), fireCb);
	};
	
	self.findValidLocalisation = function findValidLocalisation(loc) {
    if( !loc
        || !config.elaiJS.matchValidLocalisation
        || !config.elaiJS.matchValidLocalisation[loc])
      return loc;
    
    return self.findValidLocalisation(config.elaiJS.matchValidLocalisation[loc]);
	};
	
	self.toLocaleString = function (date, loc) {
	  if(loc)
	    loc = self.findValidLocalisation(loc);
	  
	  if(!loc)
	    loc = self.getLocalisation();
	  
	  if(!helper.isObject(date))
      date = new Date(date);
	  
	  return date.toLocaleString(loc);
	};
  
	return self;
});