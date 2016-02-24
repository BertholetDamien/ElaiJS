define(["elaiJS/configuration"], function(config) {
	'use strict';

	var self = {};
	self.startDebugMode = function () {
    for(var key in config.elaiJS.debugModules)
      loadModule(key, config.elaiJS.debugModules[key] || key);
	};
	
	function loadModule(key, moduleName) {
    require([key], function (module) {
      moduleName = moduleName.replace("/", "_");
  		window[moduleName] = module;
  	});
	}
	
	return self;
});