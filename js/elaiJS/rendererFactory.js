define(["elaiJS/helper", "elaiJS/promise"], function(helper, Promise) {
	'use strict';
	
	return function(rendererInfo, pluginInfo, plugin) {
		function initialize() {
			this.elementDOM = undefined;
			this.refreshElementDOM = undefined;
			if(helper.isFunction(rendererInfo.initialize))
		    return rendererInfo.initialize.call(this);
		}
		
		function refreshRender() {
			return rendererInfo.loadLib().then(_refreshRender.bind(this));
		}

    function render() {
      return rendererInfo.loadLib().then(_render.bind(this));
		}
		
    function _render() {
      initDOMELement.call(this);
      
      if(helper.isFunction(rendererInfo.render))
        return rendererInfo.render.call(this);
      
      return Promise.resolve().then(function() {
				return rendererInfo.getHTML.call(this).then(function(html) {
					setElementDOMHTML.call(this, html, this.elementDOM);
				}.bind(this));
      }.bind(this));
		}

		function _refreshRender() {
      initRefreshDOMELement.call(this);
      
      if(helper.isFunction(rendererInfo.refreshRender))
        return rendererInfo.refreshRender.call(this);
      
      return Promise.resolve().then(function() {
				return rendererInfo.getRefreshHTML.call(this, true).then(function(html) {
					setElementDOMHTML.call(this, html, this.refreshElementDOM, true);
				}.bind(this));
      }.bind(this));
		}
		
		function initDOMELement() {
			var elementDOM = findDOMElement.call(this);
			if(!elementDOM)
				throw new Error("Can't find DOM element for widget: " + this.id);
      
			this.elementDOM = elementDOM;
		}
		
		function findDOMElement() {
		  var elem;
		  if(helper.isFunction(this.findDOMElement))
		    elem = this.findDOMElement();
		  
		 	return elem || document.getElementById(this.id);
		}

		function initRefreshDOMELement() {
			var elementDOM = findRefreshDOMElement.call(this);
			if(!elementDOM)
				throw new Error("Can't find Refresh DOM element for widget: " + this.id);
      
			this.refreshElementDOM = elementDOM;
		}
		
		function findRefreshDOMElement() {
		  var elem;
		  if(helper.isFunction(this.findRefreshDOMElement))
		    elem = this.findRefreshDOMElement();
		  if(elem)
		  	return elem;
		  
		  return this.elementDOM.getElementsByClassName("refreshContainer")[0];
		}

  /************************************************************************
	 ******************************* Set HTML *******************************
	 ************************************************************************/
		function setElementDOMHTML(html, elementDOM, refreshMode) {
	    elementDOM.innerHTML = html;
	    if(!refreshMode)
				manageClass.call(this, true);
		}
		
    function removeRender() {
      if(helper.isFunction(rendererInfo.removeRender))
			  return rendererInfo.removeRender.call(this);
			  
      if(!this.elementDOM)
        return;
	    
      this.elementDOM.innerHTML = "";
      manageClass.call(this, false);
    }
	  
	  function manageClass(add) {
	    var action = (add) ? "add" : "remove";
	    var nameClass = this.name.replace(/\//g, "_");
			this.elementDOM.classList[action](nameClass);
			this.elementDOM.classList[action]("widget");
			
		  if(this.mode)
  		  this.elementDOM.classList[action]("mode-" + this.mode);
	  }
    
    plugin.initializeBeforeWidget 	= initialize;
    
    if(pluginInfo.useForRender !== false) {
    	plugin.removeRenderBeforeWidget = removeRender;
  		plugin.renderBeforeWidget 			= render;
    }

    if(pluginInfo.useForRefreshRender)
    	plugin.refreshRenderBeforeWidget = refreshRender;

    return plugin;
	};
});