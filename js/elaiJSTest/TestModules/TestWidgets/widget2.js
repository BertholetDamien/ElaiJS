define(["elaiJS/helper"], function(helper) {
  'use strict';
  var properties = {};
  
  properties.builder = function() {
    this.addEventFunctions = function() {
      this.cycleLife = [];
      
      var names = [ "create", "initialize", "initializeVariables", "refresh", "refreshData", "fetchData",
                    "setData", "processRowData", "refreshRender", "render", "removeRender", "reload",
                    "destroy", "remove"];
      for(var i in names) {
        var name = names[i];
        var capiName = helper.capitalize(name);
        addEventFunction.call(this, "before" + capiName);
        addEventFunction.call(this, "after" + capiName);
        
        addEventFunction.call(this, "before" + capiName + "BeforeWidgetPlugins");
        addEventFunction.call(this, "after" + capiName + "AfterWidgetPlugins");
        
        addEventFunction.call(this, "before" + capiName + "Children");
        addEventFunction.call(this, "after" + capiName + "Children");
        
        addEventFunction.call(this, "_" + name);
      }
    };
  
    function addEventFunction(name) {
      this[name] = function(callback) {
        this.cycleLife.push(name);
        
        if(helper.isFunction(callback))
          callback();
      };
    }
  };
  
  return properties;
});