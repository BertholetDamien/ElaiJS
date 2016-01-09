define([], function() {
	'use strict';

  function build(definition) {
  	var self = {};
  	
  	var currentKey;
  	var properties = {};
  
    self.initialize = function initialize(callback) {
      loadProperties(definition.getDefaultKey());
      
      var key = definition.findFirstKey() || definition.getDefaultKey();
      self.setKey(key, callback);
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
  	
  	self.setKey = function setKey(key, callback) {
      currentKey = key;
      
      if(!properties[currentKey])
        loadProperties(currentKey, callback);
      else if(callback)
        callback();
  	};
  	
  	function loadProperties(key, callback) {
      definition.loadProperties(key, function(propertie) {
        properties[key] = propertie;
        if(callback)
          callback();
      });
  	}
  
  	return self;
  }
  
  return {build: build};
});