define(["elaiJS/helper"], function(helper) {
	'use strict';
  
	var self = function(data, keepDefined) {
	  var scope = (!this || this === window) ? self : this;
  	merges(data, scope, keepDefined);
	};
	
	function merges(src, dest, keepDefined) {
		for(var key in src) {
  		if(helper.isObject(src[key]) && helper.isObject(dest[key]))
        merges(src[key], dest[key], keepDefined);
	    else if((keepDefined && dest[key] === undefined) || !keepDefined)
        dest[key] = src[key];
		}
	}
	
	return self;
});