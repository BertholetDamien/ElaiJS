define([], function() {
  'use strict';
  var properties = {};

  var num = 1;
  var privStatic = 0;
  
  properties.builder = function(proto) {
    var priv = 0;
    proto.priv = function() {
      ++priv;
      return priv;
    };
    
    proto.privStatic = function() {
      ++privStatic;
      return privStatic;
    };

    proto["only" + num] = function() {
      return num;
    };
    
    proto.all = function() {
      return num;
    };
    
    proto.parent = function() {
      return num + "";
    };
    
    return proto;
  };
  
  return properties;
});