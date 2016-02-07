define([  "elaiJS/configuration", "elaiJS/webservice", "elaiJS/helper",
          "elaiJS/propertiesManagerFactory", "elaiJS/binder"],
          function(config, webservice, helper, manager, binder) {
	'use strict';
	
  var propertiesManager = manager.build({
    name: "Localisation",
    getDefaultKey: function() {
      return self.findValidLocalisation(config.defaultLocalisation);
    },
    loadProperties: function(n, cb) {webservice.loadLocalisationFile(n, cb);},
    findFirstKey: findFirstKey
  });
  
	var self = {};
	binder.addFunctions(self);
	var EVENT = {localisationChanged: "localisationChanged"};
	self.EVENT = EVENT;
	
  self.initialize = propertiesManager.initialize;
  
	self.getLocalisation = propertiesManager.getCurrentKey;
	
  function findFirstKey() {
    if(config.autoFindLocalisation !== true)
      return undefined;
    
    var loc = window.navigator.userLanguage || window.navigator.language;
    return self.findValidLocalisation(loc);
  }
  
	self.get = function get(keyPropertie, loc) {
    return propertiesManager.get(keyPropertie, self.findValidLocalisation(loc));
	};
	
	self.setLocalisation = function setLocalisation(rawLocalisation, callback) {
	  var fireCb = binder.buildFireCallBack(this, EVENT.localisationChanged, callback);
    propertiesManager.setKey(self.findValidLocalisation(rawLocalisation), fireCb);
	};
	
	self.findValidLocalisation = function findValidLocalisation(loc) {
    if(!loc || !config.matchValidLocalisation || !config.matchValidLocalisation[loc])
      return loc;
    
    return self.findValidLocalisation(config.matchValidLocalisation[loc]);
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