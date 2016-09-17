define([  "elaiJS/promise", "elaiJS/configuration",
          "elaiJSTest/modules/moduleTestor"],
          function(Promise, config, ModuleTestor) {
	'use strict';

	var properties = {};

	properties.builder = function(proto) {
	  proto.modules = undefined;

		proto._initialize = function _initialize() {
		  this.modules = buildModules();
		  
		  return createModulesWidget.call(this);
		};
		
	  function buildModules() {
      var modulesName = config.testModules;
      var modules = [];
  	  for(var i = 0 ; i < modulesName.length ; ++i)
        modules.push(new ModuleTestor(i + 1, modulesName[i]));
      return modules;
    }
    
    function createModulesWidget() {
      var promises = [];
      for(var i in this.modules)
        promises.push(createModuleWidget.call(this, this.modules[i]));
     	return Promise.all(promises);
    }
		
		function createModuleWidget(module) {
		  var id = "module" + module.index;
	    return this.createChild("module", id, {module: module});
		}
		
		proto._destroy = function _destroy() {
		  for(var i = 0 ; i < this.modules.length ; ++i)
		    this.modules[i].destroy();
		};

		return proto;
	};

	return properties;
});