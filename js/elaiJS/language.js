define([  "elaiJS/configuration", "elaiJS/webservice",
          "elaiJS/propertiesManagerFactory", "elaiJS/binder"],
          function(config, webservice, manager, binder) {
	'use strict';

  var propertiesManager = manager.build({
    name: "Language",
    getDefaultKey: function() {return config.elaiJS.defaultLanguage;},
    loadProperties: function(name, cb) {webservice.loadLanguageFile(name, cb);},
    findFirstKey: findFirstKey
  });
  
	var self = {};
	binder.addFunctions(self);
	var EVENT = {languageChanged: "languageChanged"};
	self.EVENT = EVENT;
	
  self.initialize = propertiesManager.initialize;
	self.getLanguage = propertiesManager.getCurrentKey;
	
	self.setLanguage = function setLocalisation(rawLanguage, callback) {
	  var fireCb = binder.buildFireCallBack(this, EVENT.languageChanged, callback);
    propertiesManager.setKey(rawLanguage, fireCb);
	};

  function findFirstKey() {
    var language = window.navigator.userLanguage || window.navigator.language;
    if(config.elaiJS.autoFindLanguage !== true || !language)
      return undefined;
    
    return language.split("-")[0];
  }
  
	self.get = function get(keyPropertie, params, language) {
    var value = propertiesManager.get(keyPropertie, language);
    if(!value)
      return value;
    
    for(var key in params) {
      var regex = new RegExp("\\{\\{" + key + "\\}\\}", "g");
      value = value.replace(regex, params[key]);
    }
    
    return value;
	};

	return self;
});