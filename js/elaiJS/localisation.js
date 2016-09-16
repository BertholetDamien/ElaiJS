define([  "elaiJS/configuration", "elaiJS/webservice", "elaiJS/helper",
          "elaiJS/propertiesManagerFactory", "elaiJS/binder", "elaiJS/localStorage"],
          function(config, webservice, helper, manager, binder, localStorage) {
	'use strict';
	
  var propertiesManager = manager.build({
    name: "Localisation",
    getDefaultKey: function() {
      return self.findDefaultLocalisation(config.elaiJS.defaultLocalisation);
    },
    loadProperties: function(n) {
      return webservice.loadLocalisation(n);
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
    
    return self.findDefaultLocalisation(loc);
  }
  
	self.get = function get(keyPropertie, loc) {
    return propertiesManager.get(keyPropertie, self.findDefaultLocalisation(loc));
	};
	
	self.setLocalisation = function setLocalisation(rawLocalisation) {
    if(config.elaiJS.localisationStorageKey)
      localStorage.set(config.elaiJS.localisationStorageKey, rawLocalisation);
    
    var fireCb = binder.buildFireCallBack(this, EVENT.localisationChanged);
    var localisation = self.findDefaultLocalisation(rawLocalisation);
    return propertiesManager.setKey(localisation).then(fireCb);
	};
	
	self.findDefaultLocalisation = function findDefaultLocalisation(loc) {
    if( !loc
        || !config.elaiJS.matchValidLocalisation
        || !config.elaiJS.matchValidLocalisation[loc])
      return loc;
    
    return self.findDefaultLocalisation(config.elaiJS.matchValidLocalisation[loc]);
	};
	
	self.toLocaleString = function (date, loc) {
    loc = self.findDefaultLocalisation(loc) || self.getLocalisation();
	  
	  if(!helper.isObject(date))
      date = new Date(date);
	  
	  return date.toLocaleString(loc);
	};
  
	return self;
});