define(["elaiJS/promise"], function(Promise) {
	'use strict';

  function build(definition) {
  	var self = {};
  	
  	var currentKey;
  	var properties = {};
  
    self.initialize = function initialize() {
      var promiseCurrent = loadProperties(definition.getDefaultKey());
      
      var key = definition.findFirstKey() || definition.getDefaultKey();
      var promise = self.setKey(key);
      return Promise.all([promiseCurrent, promise]);
    };
    
  	self.get = function get(propertieKey, key) {
  	  if(key)
	      return getPropertie(propertieKey, key);

      var value = getPropertie(propertieKey, currentKey);
      if(!value && definition.getDefaultKey() != currentKey)
        return getPropertie(propertieKey, definition.getDefaultKey());
      
      return value;
  	};
  	
  	function getPropertie(propertieKey, key) {
  	  if(!properties[key])
        throw definition.name + " '" + key + "' is not loaded.";
        
      return properties[key][propertieKey];
  	}
  	
  	self.getCurrentKey = function getCurrentKey() {
      return currentKey;
  	};
  	
  	self.setKey = function setKey(key) {
      currentKey = key;
      
      if(!properties[currentKey])
        return loadProperties(currentKey);
      return Promise.resolve();
  	};
  	
  	function loadProperties(key) {
      return definition.loadProperties(key).then(function(propertie) {
        properties[key] = propertie;
      }, function(e) {
        console.error("Loading error with properties '" + key + "' of " + definition.name);
      });
  	}
  
  	return self;
  }
  
  return {build: build};
});