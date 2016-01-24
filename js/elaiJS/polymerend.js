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
      require([config.polymereLib]);
      window.addEventListener('WebComponentsReady', function() {
        polymerLoaded = true;
        rendererInfo.fire("libLoaded");
      });
		}
		
  /************************************************************************
	 ************************** Render Template *****************************
	 ************************************************************************/
		function render(callback) {
			var _this = this;

      var info = getComponentInfo.call(this);
      var componentName = mode.getRessource("WebComponent", info);
      
      this.elemPoly = document.createElement(componentName);
      
      if(this.polyData)
        this.elemPoly.data = this.polyData;
      this.elemPoly.widget = this;
      
      this.elementDOM.appendChild(this.elemPoly);
      
			callback();
		}
		
		function getComponentInfo() {
		  if(!helper.isFunction(this.getComponentInfo))
		    return {name: "widget-" + this.name, mode: this.mode};
		  
      var info = this.getComponentInfo();
      if(helper.isObject(info))
        return info;
      return {name: info, mode: this.mode};
		}
		
		return renderer;
	};
});