define(["elaiJS/helper", "elaiJS/promise"], function(helper, Promise) {
	'use strict';
	
	return function(rendererInfo, pluginInfo, plugin) {
	  var initializeBeforeWidget 		= plugin.initializeBeforeWidget;
	  var renderBeforeWidget 				= plugin.renderBeforeWidget;
	  var removeRenderBeforeWidget 	= plugin.removeRenderBeforeWidget;
	  
		function initialize() {
			this.elementDOM = undefined;
			if(helper.isFunction(initializeBeforeWidget))
		    initializeBeforeWidget.call(this);
		}
		
    function render() {
      return rendererInfo.loadLib().then(_render.bind(this));
		}
		
    function _render() {
      var _this = this;
      initDOMELement.call(this);
      
      if(helper.isFunction(rendererInfo.render))
        return rendererInfo.render.call(this, callback);
      
      return new Promise(function(resolve, reject) {
				rendererInfo.getHTML.call(this, function(html) {
					setElementDOMHTML.call(_this, html);
			    
			    if(helper.isFunction(removeRenderBeforeWidget))
				    removeRenderBeforeWidget.call(this, resolve);
		      else
			      resolve();
				});
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

  /************************************************************************
	 ******************************* Set HTML *******************************
	 ************************************************************************/
		function setElementDOMHTML(html) {
      if(mustAppendHTML.call(this))
        return this.elementDOM.insertAdjacentHTML("beforeend", html);
      
	    this.elementDOM.innerHTML = html;
			manageClass.call(this, true);
		}
		
    function removeRender() {
      if(helper.isFunction(rendererInfo.removeRender))
			  return rendererInfo.removeRender.call(this);
			  
      if(!this.elementDOM || mustAppendHTML.call(this))
        return;
	    
      this.elementDOM.innerHTML = "";
      manageClass.call(this, false);
      
      if(helper.isFunction(removeRenderBeforeWidget))
			  removeRenderBeforeWidget.call(this);
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
    
    return plugin;
	};
});