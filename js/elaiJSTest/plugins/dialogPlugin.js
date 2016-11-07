define([  "elaiJS/binder", "elaiJS/helper"],
          function(binder, helper) {
	'use strict';
	return function(widget, pluginInfo) {
    function getCSSRules() {
		  var cssRules = "";
		  cssRules += "position: fixed;";
      cssRules += "top: 0;";
      cssRules += "left: 0;";
      cssRules += "z-index: 999;";
      cssRules += "background-color: rgba(0, 0, 0, .2);";
      cssRules += "display: flex;";
      cssRules += "flex-direction: column;";
      cssRules += "justify-content: center;";
      cssRules += "align-items: center;";
      cssRules += "width: 100%;";
      cssRules += "height: 100%;";
      
		  return cssRules;
		}
		
		function findParentElement() {
      if(helper.isFunction(this.findParentElement))
        return this.findParentElement();
	      
      var elementDOM = document.getElementById(this.id);
      if(!elementDOM)
        elementDOM = document.getElementsByTagName("body")[0];
      return elementDOM;
    }
	  
    function manageBodyKeyUp(event, data) {
      if(event.data.keyCode === 27)
        this.removeRender();
    }
	  
    binder.bindGlobal("body_keyUp", manageBodyKeyUp, undefined, widget);
  	
		return {
		  removeRenderBeforeWidget: function() {
		    if(this.elementDialog && this.elementDialog.parentNode)
		      this.elementDialog.parentNode.removeChild(this.elementDOM);
		  },
		  destroyBeforeWidget: function() {
        binder.unbindGlobal("body_keyUp", manageBodyKeyUp);
		  },
		  renderBeforeWidget: function() {
        this.elementDialog = document.createElement("div");
  		  this.elementDialog.classList.add("dialog");
  		  this.elementDialog.setAttribute("style", getCSSRules());
  		  
  		  var parentDOM = findParentElement.call(this);
        parentDOM.appendChild(this.elementDialog);
        
        this.elementDialog.onclick = function(event) {
          if(this.elementDialog === event.target)
            this.removeRender();
        }.bind(this);
		  }
		};
	};
});