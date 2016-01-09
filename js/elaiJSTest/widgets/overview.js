define([  "elaiJS/multicallback", "elaiJS/configuration",
          "elaiJSTest/modules/moduleTestor"],
          function(multicallback, config, ModuleTestor) {
	'use strict';

	var properties = {};

	properties.builder = function(proto) {
	  proto.modules = undefined;

		proto._initialize = function _initialize(callback) {
		  this.modules = buildModules();
		  
		  createModulesWidget.call(this, callback);
		};
		
	  function buildModules() {
      var modulesName = config.testModules;
      var modules = [];
  	  for(var i = 0 ; i < modulesName.length ; ++i)
        modules.push(new ModuleTestor(i + 1, modulesName[i]));
      return modules;
    }
    
    function createModulesWidget(callback) {
      var count = this.modules.length;
      
      var multiCallBackFunction = multicallback(count, callback);
      for(var i = 0 ; i < count ; ++i)
        createModuleWidget.call(this, this.modules[i], multiCallBackFunction);
    }
		
		function createModuleWidget(module, callback) {
		  var id = "module" + module.index;
	    this.createChild("module", id, {module: module}, callback);
		}
		
		proto._destroy = function _destroy() {
		  for(var i = 0 ; i < this.modules.length ; ++i)
		    this.modules[i].destroy();
		};

		return proto;
	};

	return properties;
});