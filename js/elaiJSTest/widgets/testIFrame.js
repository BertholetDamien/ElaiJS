define(["elaiJS/promise", "elaiJS/defaultConfiguration"],
        function(Promise, defaultConf) {
	'use strict';

	var properties = {};
	properties.parent = "iframe";
	
	properties.builder = function() {
	  this._initialize = function _initialize() {
	    this.params = {
	        needDisplay: false,
	        canRemoveRender: false,
	        iframeSrc: "testiframe.html?module=" + this.params.name
	    };
	  };
	  
	  this._render = function _render(callback) {
      this.super._render.call(this);
      
      return new Promise(function(resolve, reject) {
      	this.elementDOM.contentWindow.callbackReady = resolve;
      }.bind(this));
	  };
    
	  this.getElaiJSTestIFrame = function() {
      return this.elementDOM.contentWindow.elaiJSTestIFrame;
	  };
	};

	return properties;
});