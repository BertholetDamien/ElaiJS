define([  "elaiJS/multicallback", "elaiJS/navigator",
          "elaiJSTest/modules/moduleTestor"],
          function(multicallback, navigator, ModuleTestor) {
	'use strict';

	var properties = {};

	properties.builder = function(proto) {
	  proto.modules = undefined;

		proto._initialize = function _initialize(callback) {
		  var moduleName = navigator.getCurrentPageInfo().name;
		  this.module = new ModuleTestor(1, moduleName);
		  
		  var multiCBFct = multicallback(2, callback, this);
		  createModuleChild.call(this, multiCBFct);
		  createFeatureCodeChild.call(this, multiCBFct);
		};
		
		function createModuleChild(callback) {
		  var _this = this;
		  var moduleParams = {  module: this.module,
		                        neverCollapsed: true,
		                        selectable: true};
		  this.createChild("module", "module", moduleParams, function(widget) {
		    _this.wModule = widget;
		    bindModuleWidgetSelection.call(_this);
		    callback();
		  });
		}
		
		function createFeatureCodeChild(callback) {
		  var _this = this;
		  var featureParams = {inDialog: false};
		  this.createChild("featureCode", "featureDetail", featureParams, function(widget) {
		    _this.wFeatureCode = widget;
		    callback();
		  });
		}
		
		function bindModuleWidgetSelection() {
		  this.wModule.bind("featureSelected", function(event, params, data) {
		    this.wFeatureCode.setFeature(data);
		    this.wFeatureCode.render();
		  }, undefined, this);
		}
		
		proto._destroy = function _destroy() {
	    this.module.destroy();
		};

		return proto;
	};

	return properties;
});