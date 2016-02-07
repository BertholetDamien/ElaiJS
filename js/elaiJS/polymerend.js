define([  "elaiJS/configuration", "elaiJS/webservice", "elaiJS/mode",
          "elaiJS/helper", "elaiJS/binder", "elaiJS/rendererFactory"],
			    function( config, webservice, mode, helper, binder, rendererFactory) {
	'use strict';
	var polymerLoaded;
	
	return function(widget, pluginInfo) {
	  var rendererInfo = {
	    isLibLoaded: function() {return polymerLoaded;},
	    render: render
	  };
	  binder.addAllFunctions(rendererInfo);
	  loadPolymer();
	  
	  var plugin = {initializeVariablesBeforeWidget: initializeVariables};
	  plugin = rendererFactory(rendererInfo, pluginInfo, plugin);
		
		function initializeVariables() {
			this.viewData = undefined;
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
      
      this.elementPolymer = document.createElement(componentName);
      if(this.viewData)
        this.elementPolymer.data = this.viewData;
      this.elementPolymer.widget = this;
        
      addAttachedEvent.call(this, callback);
      addViewEvents.call(this);
      
      while(this.elementDOM.children.length > 0)
        this.elementDOM.removeChild(this.elementDOM.children[0]);
      
      this.elementDOM.appendChild(this.elementPolymer);
		}
		
		function addViewEvents() {
		  var _this = this;
		  for(var key in this.viewEvents) {
        this.elementPolymer.addEventListener(key, function(e) {
          _this.viewEvents[key].call(_this, e.detail, e);
        });
      }
		}
		
		function addAttachedEvent(callback) {
		  var _this = this;
      this.elementPolymer.addEventListener("attached", polyAttached);
      
      function polyAttached() {
        _this.elementPolymer.removeEventListener("attached", polyAttached);
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
		
		return plugin;
	};
});