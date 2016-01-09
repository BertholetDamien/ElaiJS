define(["elaiJS/multicallback", "elaiJS/defaultConfiguration"],
        function(multicallback, defaultConf) {
	'use strict';

	var properties = {};
	properties.parent = "iframe";
	
	properties.builder = function(proto) {
	  proto._initialize = function _initialize(callback) {
	    this.params = {
	        needDisplay: false,
	        canRemoveRender: false,
	        iframeSrc: "testiframe.html?module=" + this.params.name
	    };
	    
	    callback();
	  };
	  
	  proto._render = function _render(callback) {
	    var _this = this;
      
      this.super._render.call(this, function() {
        _this.elementDOM.contentWindow.callbackReady = callback;
      });
	  };
    
	  proto.getElaiJSTestIFrame = function() {
      return this.elementDOM.contentWindow.elaiJSTestIFrame;
	  };
	  
		return proto;
	};

	return properties;
});