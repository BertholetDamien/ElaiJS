define([  "elaiJS/webservice", "elaiJS/configuration", "elaiJS/ressources",
          "elaiJS/binder"],
          function(webservice, config, res, binder) {
	'use strict';

	var self = {};
	binder.addFunctions(self);
	var EVENT = {themeChanged: "themeChanged"};
	self.EVENT = EVENT;
	
	var currentTheme;

	self.getTheme = function getTheme() {
		return currentTheme;
	};

	self.initialize = function initialize(callback, errCallback) {
    if(config.defaultTheme)
      self.setTheme(config.defaultTheme, callback, errCallback);
	};

	self.setTheme = function setTheme(theme, callback, errCallback) {
		webservice.removeTheme({name: currentTheme}, function() {
		  _setTheme(theme, callback);
		}, errCallback);
	};
	
	function _setTheme(theme, callback, errCallback) {
	  var params = {oldTheme: currentTheme, newTheme: theme};
		currentTheme = theme;
		
		if(!theme)
		  return self.fire(EVENT.themeChanged, params);
		
		webservice.loadTheme({name: theme}, function() {
		  self.fire(EVENT.themeChanged, params);
		  if(callback)
		    callback();
		}, errCallback);
	}

	return self;
});