define(["elaiJS/helper", "elaiJS/promise"], function(helper, Promise) {
	'use strict';
	
	return function(rendererInfo, pluginInfo, plugin) {
	  var initializeBeforeWidget 		= plugin.initializeBeforeWidget;
	  var renderBeforeWidget 				= plugin.renderBeforeWidget;
	  
		function initialize() {
			this.elementDOM = undefined;
			if(helper.isFunction(initializeBeforeWidget))
		    initializeBeforeWidget.call(this);
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
        return rendererInfo.render.call(this, callback);
      
      return Promise.resolve().then(function() {
				rendererInfo.getHTML.call(this, function(html) {
					setElementDOMHTML.call(this, html, this.elementDOM);
				}.bind(this));
      }.bind(this));
		}

		function _refreshRender() {
      var _this = this;
      initRefreshDOMELement.call(this);
      
      return Promise.resolve().then(function() {
				rendererInfo.getRefreshHTML.call(this, function(html) {
					setElementDOMHTML.call(this, html, this.refreshElementDOM, true);
				}.bind(this), true);
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
      if(mustAppendHTML.call(this))
        return elementDOM.insertAdjacentHTML("beforeend", html);
      
	    elementDOM.innerHTML = html;
	    if(!refreshMode)
				manageClass.call(this, true);
		}
		
    function removeRender() {
      if(helper.isFunction(rendererInfo.removeRender))
			  return rendererInfo.removeRender.call(this);
			  
      if(!this.elementDOM || mustAppendHTML.call(this))
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
    
    function mustAppendHTML() {
    	if(pluginInfo.mustAppendHTML)
    		return pluginInfo.mustAppendHTML;
    	
      return helper.isFunction(this.mustAppendHTML) && this.mustAppendHTML() === true;
    }
    
    plugin.initializeBeforeWidget 	= initialize;
    plugin.renderBeforeWidget 			= render;
    plugin.removeRenderBeforeWidget = removeRender;

    if(pluginInfo.needRefreshRender)
    	plugin.refreshRenderBeforeWidget = refreshRender;

    return plugin;
	};
});