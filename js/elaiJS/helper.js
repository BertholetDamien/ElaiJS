define([], function() {
	'use strict';
	var self = {};

	self.extractGetParams = function extractGetParams() {
		return self.extractParams(location.search.substring(1));
	};

	self.extractParams = function extractParams(string, trim) {
	  if(!string || string === "")
	    return {};
	 
    string = string.replace(/[\r\n|\r|\n]/g, "");
  	var tab = string.split("&");
  	
  	var params = {};
  	for(var i in tab) {
  		var split = tab[i].split("=");
  		var key = split[0];
  		var value = split[1];
  		if(trim) {
  		  key = key ? key.trim() : undefined;
  		  value = value ? value.trim() : undefined;
  		}
  		
  		params[key] = value;
    }
  
  	return params;
	};
	
	self.extractArray = function extractArray(string, trim) {
    if(string === undefined || string === null)
	    return [];
	 
    string = string.replace(/[\r\n|\r|\n]/g, "");
  	var tab = string.split(",");
  	
  	var array = [];
  	for(var i in tab) {
  	  var value = tab[i];
	    value = (trim && value) ? value.trim() : value;
  		array.push(value);
    }
  
  	return array;
	};

	self.isFunction = function isFunction(object) {
	  return typeof object === "function";
	};
	
	self.isObject = function isObject(object) {
    return object !== null && typeof object === "object";
	};
	
	self.getElaiJSAttribute = function getElaiJSAttribute(name) {
    var urlFile;
    var scriptElement = document.getElementsByClassName("elaiJS");
    if(scriptElement && scriptElement.length > 0)
      urlFile = scriptElement[0].getAttribute("data-" + name);
    
    if(urlFile === "")
      return undefined;
      
    return urlFile;
	};
	
	self.clone = function clone(obj) {
	  if(obj === null || obj === undefined)
	    return undefined;

    return JSON.parse(JSON.stringify(obj));
	};
	
	self.capitalize = function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.substring(1);
	};
	
	self.equals = function(obj1, obj2, strict) {
    if((strict === false && obj1 == obj2) || obj1 === obj2)
      return true;
	  
    if(!obj1 || !obj2)
	    return false;
	    
    if(!self.isObject(obj1) || !self.isObject(obj1))
      return false;
    
    if(strict !== false && Object.keys(obj1).length !== Object.keys(obj2).length)
      return false;
    
    for(var key in obj1) {
      if(!self.equals(obj1[key], obj2[key]))
        return false;
    }
    
    return true;
	};
	
	return self;
});