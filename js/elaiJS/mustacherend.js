define([  "elaiJS/configuration", "elaiJS/webservice", "elaiJS/language",
          "elaiJS/localisation", "elaiJS/helper", "elaiJS/binder",
          "elaiJS/rendererFactory"],
			    function( config, webservice, lang, loc, helper, binder,
			              rendererFactory) {
	'use strict';
	var mustache;
	
	return function(widget, pluginInfo) {
	  var rendererInfo = {
	    isLibLoaded: function() {return mustache !== undefined;},
	    getHTML: getDisplayContent,
	    initializeVariablesBeforeWidget: initializeVariables
	  };
	  binder.addAllFunctions(rendererInfo);
	  
	  loadMustache();
	  
	  var renderer = rendererFactory(rendererInfo, pluginInfo);
	  renderer.events = {
		  beforeCreate: beforeCreate
		};
		
		function initializeVariables() {
			this.templateData = undefined;
		}
		
		function beforeCreate() {
		  var cssParams = getCSSWidgetParams.call(this);
		  if(cssParams)
        webservice.loadWidgetCSS(cssParams);
		}
		
		function getCSSWidgetParams() {
      var css = pluginInfo.CSS;
		  if(css)
        return  { css: css,
                  name: this.name,
                  defaultMode: this.mode};
      
      return undefined;
		}
	  
		function loadMustache() {
		  require([config.mustacheLib], function(moduleMustache) {
        mustache = moduleMustache;
        rendererInfo.fire("libLoaded");
      });
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
		    if(Object.keys(params).length === 1 && !params.page)
		      params = {page: Object.keys(params)[0]};
		    
		    return config.buildHash(params);
		  };
		}
		
		return renderer;
	};
});