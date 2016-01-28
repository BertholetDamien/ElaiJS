define([  "elaiJS/configuration", "elaiJS/webservice", "elaiJS/mode",
          "elaiJS/language", "elaiJS/localisation", "elaiJS/helper",
          "elaiJS/binder", "elaiJS/rendererFactory"],
			    function( config, webservice, mode, lang, loc, helper,
			              binder, rendererFactory) {
	'use strict';
	var polymerLoaded;
	
	return function(widget, pluginInfo) {
	  var rendererInfo = {
	    isLibLoaded: function() {return polymerLoaded;},
	    render: render,
	    initializeVariablesBeforeWidget: initializeVariables
	  };
	  binder.addAllFunctions(rendererInfo);
	  
	  loadPolymer();
	  
	  var renderer = rendererFactory(rendererInfo, pluginInfo);
		
		function initializeVariables() {
			this.templateData = undefined;
		}
		
		function loadPolymer() {
		  if(window.WebComponents)
		    return polymerLoaded();
		  
      require([config.polymereLib]);
      window.addEventListener('WebComponentsReady', polymerLoaded);
		}
		
		function polymerLoaded() {
		  polymerLoaded = true;
      rendererInfo.fire("libLoaded");
		}
		
  /************************************************************************
	 ************************** Render Template *****************************
	 ************************************************************************/
		function render(callback) {
      var info = getWebComponentInfo.call(this);
      var componentName = mode.getRessource("WebComponent", info);
      
      this.elemPoly = document.createElement(componentName);
      
      addAttachedEvent.call(this, callback);
      addPolyEvents.call(this);
      
      this.elementDOM.appendChild(this.elemPoly);
		}
		
		function addPolyEvents() {
		  var _this = this;
		  for(var key in this.polyEvents) {
        this.elemPoly.addEventListener(key, function(e) {
          _this.polyEvents[key].call(_this, e.detail, e);
        });
      }
		}
		
		function addAttachedEvent(callback) {
		  var _this = this;
      this.elemPoly.addEventListener("attached", polyAttached);
      
      function polyAttached() {
        _this.elemPoly.removeEventListener("attached", polyAttached);
        
        if(_this.viewData)
          _this.elemPoly.data = _this.viewData;
        _this.elemPoly.widget = _this;
        callback();
      }
		}
		
		function getWebComponentInfo() {
		  if(!helper.isFunction(this.getWebComponentInfo))
		    return {name: this.name, mode: this.mode};
		  
      var info = this.getWebComponentInfo();
      if(helper.isObject(info))
        return info;
      return {name: info, mode: this.mode};
		}
		
		return renderer;
	};
});