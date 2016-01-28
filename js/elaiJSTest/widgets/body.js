define([  "elaiJS/multicallback", "elaiJS/navigator", "elaiJS/language"],
          function(multicallback, navigator, lang) {
	'use strict';
  return function() {
	  
	  this._create = function _create(callback) {
	    var _this = this;
		  document.getElementsByTagName("body")[0].onkeyup = function(event) {
        _this.fireGlobal("body_keyUp", event);
      };
      
      callback();
	  };

		this._initialize = function _initialize(callback) {
		  lang.bind(lang.EVENT.languageChanged, this.renderChildren, undefined, this);
		  navigator.bind(navigator.EVENT.pageChanged, pageChanged, undefined, this);
		  
		  var multiCBFct = multicallback(2, callback);
		  this.createChild("topactions", "topactions", undefined, multiCBFct);
		  createPageWidget.call(this, multiCBFct);
		};
		
		function pageChanged() {
		  this.destroyChildByID("page");
		  createPageWidget.call(this, function(widget) {
		    widget.render();
		  });
		}
		
		function createPageWidget(callback) {
		  var page = navigator.getCurrentPageInfo().page;
		  this.createChild(page, "page", undefined, callback);
		}
		
		this.findDOMElement = function findDOMElement() {
			return document.getElementsByTagName("body")[0];
		};

		return proto;
	};
});