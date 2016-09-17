define([  "elaiJS/configuration", "elaiJS/mode", "elaiJS/helper",
					"elaiJS/binder", "elaiJS/rendererFactory", "elaiJS/promise"],
			    function( config, mode, helper, binder, rendererFactory, Promise) {
	'use strict';
	
	return function(widget, pluginInfo) {
	  var rendererInfo = {
	    loadLib: loadPolymer,
	    render: render
	  };
	  binder.addAllFunctions(rendererInfo);
	  
	  var plugin = {initializeVariablesBeforeWidget: initializeVariables};
	  plugin = rendererFactory(rendererInfo, pluginInfo, plugin);
		
		function initializeVariables() {
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
	        
	      addAttachedEvent.call(this, resolve);
	      addViewEvents.call(this);
	      
	      while(this.elementDOM.children.length > 0)
	        this.elementDOM.removeChild(this.elementDOM.children[0]);
	      
	      this.elementDOM.appendChild(this.elementPolymer);
      }.bind(this));
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