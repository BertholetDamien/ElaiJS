define(["elaiJS/helper"], function(helper) {
	'use strict';
	
	return function(rendererInfo, pluginInfo) {
		function checkLoadedLib(callback) {
		  if(rendererInfo.isLibLoaded.call(this))
		    return callback();
		  
		  rendererInfo.bindOne("libLoaded", callback);
		}
		
		function initializeVariables() {
			this.elementDOM = undefined;
			if(helper.isFunction(rendererInfo.initializeVariablesBeforeWidget))
			  rendererInfo.initializeVariablesBeforeWidget();
		}
		
    function render(callback) {
      var _this = this;
      checkLoadedLib(function() {
        if(pluginInfo.useQueue)
          setTimeout(function() {
            _render.call(_this, callback);
          });
        else
          _render.call(_this, callback);
      });
		}
		
    function _render(callback) {
      var _this = this;
      initDOMELement.call(this);
      
      if(helper.isFunction(rendererInfo.render))
        return rendererInfo.render.call(this, callback);
      
			rendererInfo.getHTML.call(this, function(html) {
				setElementDOMHTML.call(_this, html);
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
      if(!this.elementDOM || mustAppendHTML.call(this))
        return;
	    
      this.elementDOM.innerHTML = "";
      manageClass.call(this, false);
      
      if(helper.isFunction(rendererInfo.removeRenderBeforeWidget))
			  rendererInfo.removeRenderBeforeWidget();
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

		return {
	    initializeVariablesBeforeWidget: initializeVariables,
      renderBeforeWidget: render,
      removeRenderBeforeWidget: removeRender
		};
	};
});