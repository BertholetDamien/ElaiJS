define([], function() {
  'use strict';
  var properties = {};
  
  properties.plugins = {
    plugin1: {
      sun: "hug"
    },
    plugin2: {
      inherit: true
    }
  };
  
  properties.builder = function(proto) {
    
    return proto;
  };
  
  return properties;
});