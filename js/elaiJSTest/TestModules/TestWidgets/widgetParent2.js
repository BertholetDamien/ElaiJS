define([], function() {
  'use strict';
  var properties = {};

  var num = 2;  
  var privStatic = 0;
  properties.parent = "widgetParent" + (num - 1);
  
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
      return num + "" + proto.super.parent();
    };
    
    return proto;
  };
  
  return properties;
});