define([  "elaiJS/configuration", "elaiJS/mode", "elaiJS/helper",
					"elaiJS/binder", "elaiJS/rendererFactory", "elaiJS/promise"],
			    function( config, mode, helper, binder, rendererFactory, Promise) {
	'use strict';
	
	return function(widget, pluginInfo) {
	  var rendererInfo = {
	    loadLib: loadPolymer,
	    render: render,
	    initialize: initialize
	  };
	  binder.addAllFunctions(rendererInfo);
	  
	  var plugin = rendererFactory(rendererInfo, pluginInfo, {});
		
		function initialize() {
			this.viewData = undefined;
		}
		
		function loadPolymer() {
			return new Promise(function(resolve, reject) {
				if(window.WebComponents)
			    resolve()
			  
	      require([config.elaiJS.polymereLib]);
	      window.addEventListener('WebComponentsReady', resolve);
			});
		}
		
  /************************************************************************
	 ************************** Render Template *****************************
	 ************************************************************************/
		function render() {
			return new Promise(function(resolve, reject) {
	      var info = getWebComponentInfo.call(this);
	      var ressourceName = info.ressource || "WebComponent";
	      var componentName = mode.getRessource(ressourceName, info);
	      
	      this.elementPolymer = document.createElement(componentName);
	      if(this.viewData)
	        this.elementPolymer.data = this.viewData;
	      this.elementPolymer.widget = this;
	        
	      addViewEvents.call(this);
	      
	      while(this.elementDOM.children.length > 0)
	        this.elementDOM.removeChild(this.elementDOM.children[0]);
	      
	      addAttachedEvent.call(this, resolve);
	      this.elementDOM.appendChild(this.elementPolymer);
      }.bind(this));
		}
		
		function addViewEvents() {
		  for(var key in this.viewEvents) {
        this.elementPolymer.addEventListener(key, function(e) {
          this.viewEvents[key].call(this, e.detail, e);
        }.bind(this));
      }
		}
		
		function addAttachedEvent(callback) {
      this.elementPolymer.addEventListener("attached", polyAttached.bind(this));
      
      function polyAttached() {
        this.elementPolymer.removeEventListener("attached", polyAttached);
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