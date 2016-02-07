define(["elaiJS/helper"], function(helper) {
	'use strict';
	
	return function(rendererInfo, pluginInfo, plugin) {
	  var initializeVariablesBeforeWidget = plugin.initializeVariablesBeforeWidget;
	  var renderBeforeWidget              = plugin.renderBeforeWidget;
	  var removeRenderBeforeWidget        = plugin.removeRenderBeforeWidget;
	  
		function waitLib(callback) {
		  if(rendererInfo.isLibLoaded.call(this))
		    return callback.call(this);
		  
		  rendererInfo.bindOne("libLoaded", callback, undefined, this);
		}
		
		function initializeVariables() {
			this.elementDOM = undefined;
			if(helper.isFunction(initializeVariablesBeforeWidget))
		    initializeVariablesBeforeWidget.call(this);
		}
		
    function render(callback) {
      waitLib.call(this, function() {
        _render.call(this, callback);
      });
		}
		
    function _render(callback) {
      var _this = this;
      initDOMELement.call(this);
      
      if(helper.isFunction(rendererInfo.render))
        return rendererInfo.render.call(this, callback);
      
			rendererInfo.getHTML.call(this, function(html) {
				setElementDOMHTML.call(_this, html);
		    
		    if(helper.isFunction(removeRenderBeforeWidget))
			    removeRenderBeforeWidget.call(this, callback);
        else
		      callback();
			});
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
      return helper.isFunction(this.mustAppendHTML) && this.mustAppendHTML() === true;
    }
    
    plugin.initializeVariablesBeforeWidget  = initializeVariables;
    plugin.renderBeforeWidget               = render;
    plugin.removeRenderBeforeWidget         = removeRender;
    
    return plugin;
	};
});