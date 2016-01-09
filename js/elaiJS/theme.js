define([  "elaiJS/webservice", "elaiJS/configuration", "elaiJS/ressources",
          "elaiJS/binder"],
          function(webservice, config, res, binder) {
	'use strict';

	var self = {};
	binder.addFunctions(self);
	var EVENT = {themeChanged: "themeChanged"};
	self.EVENT = EVENT;
	
	var currentTheme;
  var currentElement;

	self.getTheme = function getTheme() {
		return currentTheme;
	};

	self.initialize = function initialize() {
    if(config.defaultTheme)
      self.setTheme(config.defaultTheme);
	};

	self.setTheme = function setTheme(theme) {
		deleteCurremtThemCSS();
		currentElement = undefined;
		var params = {oldTheme: currentTheme, newTheme: theme};
		currentTheme = theme;
		self.fire(EVENT.themeChanged, params);
		
		if(!theme)
		  return;
		
		var url = res.get("theme", {name: theme});
		webservice.loadCSS(url, function(elemLink) {
      elemLink.classList.add("theme");
		  currentElement = elemLink;
		}, {useCache: false});
	};

	function deleteCurremtThemCSS() {
    if(currentElement && currentElement.parentNode)
      currentElement.parentNode.removeChild(currentElement);
	}

	return self;
});