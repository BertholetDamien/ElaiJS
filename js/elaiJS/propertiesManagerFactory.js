define(["elaiJS/multicallback", "elaiJS/helper"],
        function(multicallback, helper) {
	'use strict';

  function build(definition) {
  	var self = {};
  	
  	var currentKey;
  	var properties = {};
  
    self.initialize = function initialize(callback, errCallback) {
      var multiCBFct = multicallback(2, callback);
      
      loadProperties(definition.getDefaultKey()).then(multiCBFct, errCallback);
      
      var key = definition.findFirstKey() || definition.getDefaultKey();
      self.setKey(key, multiCBFct, errCallback);
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
  	
  	self.setKey = function setKey(key, callback, errCallback) {
      currentKey = key;
      
      if(!properties[currentKey])
        loadProperties(currentKey).then(callback, errCallback);
      else if(helper.isFunction(callback))
        callback();
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