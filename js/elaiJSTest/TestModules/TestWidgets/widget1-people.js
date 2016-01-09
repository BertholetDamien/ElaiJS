define([], function() {
  'use strict';
  var properties = {};
  
  properties.plugins = {
    plugin1: {}
  };
  
  properties.builder = function(proto) {
    proto.isMode = function() {
      return 42;
    };
    
    return proto;
  };
  
  return properties;
});