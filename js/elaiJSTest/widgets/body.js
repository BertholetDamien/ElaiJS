define([  "elaiJS/promise", "elaiJS/navigator", "elaiJS/language"],
          function(Promise, navigator, lang) {
	'use strict';
  return function() {
	  
	  this._create = function _create() {
	    var _this = this;
		  document.getElementsByTagName("body")[0].onkeyup = function(event) {
        _this.fireGlobal("body_keyUp", event);
      };
	  };

		this._initialize = function _initialize() {
		  lang.bind(lang.EVENT.languageChanged, this.renderChildren, undefined, this);
		  navigator.bind(navigator.EVENT.pageChanged, pageChanged, undefined, this);
		  
		  return Promise.all([
		  	this.createChild("topactions", "topactions"),
		  	createPageWidget.call(this)
		  ]);
		};
		
		function pageChanged() {
		  this.destroyChildByID("page");
		  createPageWidget.call(this).then(function(widget) {
		    widget.render();
		  });
		}
		
		function createPageWidget() {
		  var page = navigator.getCurrentPageInfo().page;
		  return this.createChild(page, "page");
		}
		
		this.findDOMElement = function findDOMElement() {
			return document.getElementsByTagName("body")[0];
		};
	};
});