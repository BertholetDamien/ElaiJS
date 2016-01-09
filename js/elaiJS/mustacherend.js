define([  "elaiJS/configuration", "elaiJS/webservice", "elaiJS/language",
          "elaiJS/localisation", "elaiJS/helper"],
			    function( config, webservice, lang, loc, helper) {
	'use strict';
	var mustache;
	
	return function(widget, pluginInfo) {
	  loadMustache();
	  
		function initializeVariables() {
			this.elementDOM = undefined;
			this.templateData = undefined;
		}
		
		function beforeCreate() {
		  var cssParams = getCSSWidgetParams.call(this);
		  if(cssParams)
        webservice.loadWidgetCSS(cssParams);
		}
		
		function getCSSWidgetParams() {
      var css = pluginInfo.css || pluginInfo.CSS;
		  if(css)
        return  { css: css,
                  name: this.name,
                  defaultMode: this.mode};
      
      return undefined;
		}
	  
    function render(callback) {
      if(!mustache)
        return loadMustache.call(this, callback);
        
      var _this = this;
			getDisplayContent.call(this, function (html) {
				setElementDOMHTML.call(_this, html);
		    callback();
			});
		}
		
		function loadMustache(callback) {
		  var _this = this;
		  require([config.mustacheLib], function(moduleMustache) {
        mustache = moduleMustache;
        if(callback)
          render.call(_this, callback);
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
	 ************************** Render Template *****************************
	 ************************************************************************/
		function getDisplayContent(callback) {
			var _this = this;
      var params = getTemplateInfo.call(this);
      
			webservice.loadTemplate(params, function (template) {
  			var templateData = {
          widget: _this,
          w: _this,
          data: _this.templateData,
          config: config,
          lang: getLanguageMustacheFct,
          loc: getLocalisationMustacheFct,
          buildHash: buildHashMustacheFct
        };
				
				var html = mustache.render(template, templateData);
				callback(html);
			});
		}
		
		function getTemplateInfo() {
		  if(!helper.isFunction(this.getTemplateInfo))
		    return {name: this.name, mode: this.mode};
		  
      var info = this.getTemplateInfo();
      if(helper.isObject(info))
        return info;
      return {name: info, mode: this.mode};
		}
		
		function getLanguageMustacheFct() {
		  return function(text, render) {
		    var params = helper.extractParams(render(text), true);
		    
		    if(Object.keys(params).length === 1 && !params.key)
		      params.key = Object.keys(params)[0];
		    
		    text = lang.get(params.key, params, params.lang);
        return text;
		  };
		}
		
		function getLocalisationMustacheFct() {
		  return function(text, render) {
		    var params = helper.extractParams(render(text), true);
		    
		    if(Object.keys(params).length === 1 && !params.key)
		      params.key = Object.keys(params)[0];
        
        if(params.fct === "get" || !params.fct) {
          text = loc.get(params.key, params.loc);
        }
        else {
          var array;
          if(params.arrayParams)
            array = helper.extractArray(params.arrayParams, true);
          text = loc[params.fct].apply(loc, array);  
        }
		    
        return text;
		  };
		}
		
		function buildHashMustacheFct() {
		  return function(text, render) {
		    var params = helper.extractParams(render(text), true);
		    return config.buildHash(params);
		  };
		}

  /************************************************************************
	 ******************************* Set HTML *******************************
	 ************************************************************************/
		function setElementDOMHTML(html) {
			initDOMELement.call(this);
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
		  events: {
		    beforeCreate: beforeCreate
		  },
		  initializeVariablesBeforeWidget: initializeVariables,
	    renderBeforeWidget: render,
      removeRenderBeforeWidget: removeRender
		};
	};
});