define([  "elaiJS/webservice", "elaiJS/configuration", "elaiJS/promise",
          "elaiJS/ressources", "elaiJS/binder"],
          function(webservice, config, Promise, res, binder) {
	'use strict';

	var self = {};
	binder.addFunctions(self);
	var EVENT = {themeChanged: "themeChanged"};
	self.EVENT = EVENT;
	
	var currentTheme;

	self.getTheme = function getTheme() {
		return currentTheme;
	};

	self.initialize = function initialize() {
    if(config.elaiJS.defaultTheme)
      return self.setTheme(config.elaiJS.defaultTheme);
    return Promise.resolve();
	};

	self.setTheme = function setTheme(theme) {
		return webservice.removeTheme({name: currentTheme}).then(function() {
		  return _setTheme(theme);
		});
	};
	
	function _setTheme(theme) {
	  var params = {oldTheme: currentTheme, newTheme: theme};
		currentTheme = theme;
		
		var fireCB = binder.buildFireCallBack(self, EVENT.themeChanged, undefined, params);
		if(!theme)
		  return Promise.resolve().then(fireCB);
		return webservice.loadTheme({name: theme}).then(fireCB);
	}

	return self;
});