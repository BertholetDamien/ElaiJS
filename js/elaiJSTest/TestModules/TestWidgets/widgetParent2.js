define([], function() {
  'use strict';
  var properties = {};

  var num = 2;
  var privStatic = 0;
  properties.parent = "widgetParent" + (num - 1);
  
  properties.builder = function(parent) {
    var priv = 0;
    this.priv = function() {
      ++priv;
      return priv;
    };
    
    this.privStatic = function() {
      ++privStatic;
      return privStatic;
    };

    this["only" + num] = function() {
      return num;
    };
    
    this.all = function() {
      return num;
    };
    
    this.parent = function() {
      return num + "" + parent.parent.call(this);
    };
  };
  
  return properties;
});