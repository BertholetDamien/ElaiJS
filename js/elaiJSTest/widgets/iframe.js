define([], function() {
	'use strict';

	var properties = {};
	properties.plugins = {
    "elaiJS/mustacherend": {inherit: true}
  };

	properties.builder = function(proto) {
	  
    proto._render = function _render() {
      if(this.elementDOM && !this.params.canRemoveRender)
        return;
      
      this.elementDOM = createIFrame.call(this);
	    var elemParent = this.getElementParent();
      elemParent.appendChild(this.elementDOM);
    };
	  
    proto.getElementParent = function() {
      return document.getElementsByTagName("body")[0];
	  };
	  
	  function createIFrame() {
      var elemIFrame = document.createElement("iframe");
      elemIFrame.id = this.id;
      elemIFrame.src = this.params.iframeSrc;
      if(!this.params.needDisplay)
        elemIFrame.setAttribute("style", "display: none;");
    
      return elemIFrame;
	  }
	  
	  proto._removeRender = function _removeRender() {
      if(this.params.canRemoveRender)
        removeDOM.call(this);
	  };
	  
	  proto._destroy = removeDOM;
	  function removeDOM() {
	    if(this.elementDOM && this.elementDOM.parentNode)
        this.elementDOM.parentNode.removeChild(this.elementDOM);
	  }

		return proto;
	};

	return properties;
});