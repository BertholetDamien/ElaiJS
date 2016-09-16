define([  "elaiJS/configuration", "elaiJS/webservice", "elaiJS/localStorage",
          "elaiJS/propertiesManagerFactory", "elaiJS/binder"],
          function(config, webservice, localStorage, manager, binder) {
	'use strict';

  var propertiesManager = manager.build({
    name: "Language",
    getDefaultKey: function() {return config.elaiJS.defaultLanguage;},
    loadProperties: function(name) {
      return webservice.loadLanguage(name);
    },
    findFirstKey: findFirstKey
  });
  
	var self = {};
	binder.addFunctions(self);
	var EVENT = {languageChanged: "languageChanged"};
	self.EVENT = EVENT;
	
  self.initialize = propertiesManager.initialize;
	self.getLanguage = propertiesManager.getCurrentKey;
	
	self.setLanguage = function setLanguage(language) {
    if(config.elaiJS.languageStorageKey)
      localStorage.set(config.elaiJS.languageStorageKey, language);
    
	  var fireCb = binder.buildFireCallBack(this, EVENT.languageChanged);
    return propertiesManager.setKey(language).then(fireCb);
	};

  function findFirstKey() {
    if(config.elaiJS.languageStorageKey) {
      var storeLang = localStorage.get(config.elaiJS.languageStorageKey);
      if(storeLang)
        return storeLang;
    }
    
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