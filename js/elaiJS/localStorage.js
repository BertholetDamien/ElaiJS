define( ["elaiJS/binder", "elaiJS/helper", "elaiJS/configuration"],
        function(binder, helper, config) {
  'use strict';
  
  var SEPARATOR = "___";
  var TAB = "_TAB";
  
  var self = {};
  var EVENT = {clearAll: "clearAll"};
	self.EVENT = EVENT;
  
  function getItemName(name, path) {
    path = path || config.elaiJS.storagePath;
    return path + SEPARATOR + name;
  }
  
  function check() {
    if(!window.localStorage)
      throw new Error("localStorage is not supported by your browser.");
  }
  
  function parseValue(value) {
   try {
      return JSON.parse(value);
    } catch(e) {
      return value;
    }
  }
  
  self.get = function(name, path) {
    check();
    var itemName = getItemName(name, path);
    
    var value = localStorage.getItem(itemName);
    return parseValue(value);
  };
  
  self.set = function(name, value, path) {
    check();
    fireCurrentTabEvent.call(self, name, path, value);
    
    var itemName = getItemName(name, path);
    localStorage.setItem(itemName, JSON.stringify(value));
  };
  
  self.remove = function(name, path) {
    check();
    fireCurrentTabEvent.call(self, name, path, null);
    
    var itemName = getItemName(name, path);
    localStorage.removeItem(itemName);
  };
  
  self.clearAll = function() {
    check();
    localStorage.clear();
    binder.fire.call(self, EVENT.clearAll);
  };
  
  self.clear = function(path) {
    check();
    path = path || config.elaiJS.storagePath;
    var keys = Object.keys(localStorage);
    for(var index in keys) {
      var rawKey = keys[index].split(SEPARATOR);
      if(rawKey.length > 1 && rawKey[0] === path)
        self.remove(rawKey[1], rawKey[0]);
    }
  };
  
  function fireCurrentTabEvent(name, path, newValue) {
    var oldValue = self.get(name, path);
    if(oldValue === newValue)
      return;
    var params = {key: name, path: path, newValue: newValue, oldValue: oldValue};
    
    var itemName = getItemName(name, path);
    binder.fire.call(self, itemName + TAB, params);
  }
  
  self.bindCurrentTab = function(name, callback, path, params, scope, bindOne) {
    var itemName = getItemName(name, path) + TAB;
    return binder.bind.call(self, itemName, callback, params, scope, bindOne);
  };
  
  self.bindOneCurrentTab = function(name, callback, path, params, scope) {
    var itemName = getItemName(name, path) + TAB;
    return binder.bindOne.call(self, itemName, callback, params, scope);
  };
  
  self.unbindCurrenTab = function(name, callback, path) {
    var itemName = getItemName(name, path) + TAB;
    return binder.unbind.call(self, itemName);
  };
  
  self.bind = function(name, callback, path, params, scope, bindOne) {
    var itemName = getItemName(name, path);
    return binder.bind.call(self, itemName, callback, params, scope, bindOne);
  };
  
  self.bindOne = function(name, callback, path, params, scope) {
    var itemName = getItemName(name, path);
    return binder.bindOne.call(self, itemName, callback, params, scope);
  };
  
  self.unbind = function(name, callback, path) {
    var itemName = getItemName(name, path);
    return binder.unbind.call(self, itemName, callback);
  };
  
  self.unbindAll = binder.unbindAll;
  
  window.addEventListener("storage", function(event) {
    if(!event.key)
      return;
    
    var rawKey = event.key.split(SEPARATOR);
    var path = rawKey[0];
    var key = rawKey[1];
    var params = {key: name, path: path, newValue: parseValue(event.newValue),
                  oldValue: parseValue(event.oldValue), storageEvent: event};
    binder.fire.call(self, event.key, params);
  });
  
  return self;
});