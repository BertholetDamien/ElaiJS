define([], function() {
  'use strict';
  var properties = {};
  
  properties.parent = "widgetPlugin1";
  
  properties.plugins = {
    plugin1: {
      sun: "bighug"
    },
    plugin2: {
      inherit: false,
      priority: 2
    }
  };
  
  properties.builder = function(proto) {
    
    return proto;
  };
  
  return properties;
});