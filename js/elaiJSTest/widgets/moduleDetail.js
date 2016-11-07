define([  "elaiJS/promise", "elaiJS/navigator",
          "elaiJSTest/modules/moduleTestor"],
          function(Promise, navigator, ModuleTestor) {
	'use strict';

	var properties = {};

	properties.builder = function(proto) {
	  proto.modules = undefined;

		proto._initialize = function _initialize() {
		  var moduleName = navigator.getCurrentPageInfo().name;
		  this.module = new ModuleTestor(1, moduleName);
		  
		  return Promise.all([
		  	createModuleChild.call(this),
		  	createFeatureCodeChild.call(this)
		  ]);
		};
		
		function createModuleChild() {
		  var _this = this;
		  var moduleParams = {  module: this.module,
		                        neverCollapsed: true,
		                        selectable: true};
		  return this.createChild("module", "module", moduleParams).then(function(widget) {
		    _this.wModule = widget;
		    bindModuleWidgetSelection.call(_this);
		  });
		}
		
		function createFeatureCodeChild() {
		  var _this = this;
		  var featureParams = {inDialog: false};
		  return this.createChild("featureCode", "featureDetail", featureParams).then(function(widget) {
		    _this.wFeatureCode = widget;
		  });
		}
		
		function bindModuleWidgetSelection() {
		  this.wModule.bind("featureSelected", function(event, params, data) {
		    this.wFeatureCode.setFeature(data);
		    this.wFeatureCode.render();
		  }, undefined, this);
		}
		
		proto._destroy = function _destroy() {
    	return this.module.destroy();
		};

		return proto;
	};

	return properties;
});