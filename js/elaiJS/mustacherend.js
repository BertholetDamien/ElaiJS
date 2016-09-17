define([  "elaiJS/configuration", "elaiJS/webservice", "elaiJS/language",
          "elaiJS/localisation", "elaiJS/helper", "elaiJS/binder",
          "elaiJS/rendererFactory", "elaiJS/promise"],
			    function( config, webservice, lang, loc, helper, binder,
			              rendererFactory, Promise) {
	'use strict';
	var mustache;
	
	return function(widget, pluginInfo) {
    var rendererInfo = {
      loadLib: loadMustache,
      getHTML: getDisplayContent
    };
    binder.addAllFunctions(rendererInfo);
    
    var plugin = {
      events: {
	      beforeCreate: beforeCreate
      },
      initializeVariablesBeforeWidget: initializeVariables
		};
	  plugin = rendererFactory(rendererInfo, pluginInfo, plugin);
	  
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
			return new Promise(function(resolve, reject) {
			  if(mustache)
			    resolve(mustache);
			  
			  require([config.elaiJS.mustacheLib], function(moduleMustache) {
	        mustache = moduleMustache;
	        resolve(mustache);
	      }, reject);
			});
		}
		
  /************************************************************************
	 ************************** Render Template *****************************
	 ************************************************************************/
		function getDisplayContent(callback) {
			var _this = this;
      var params = getTemplateInfo.call(this);
      
			getTemplate.call(this, params, function (template) {
  			var templateData = {
          widget: _this,
          w: _this,
          data: _this.templateData,
          config: config,
          lang: buildMustacheFct(getLanguageMustacheFct),
          loc: buildMustacheFct(getLocalisationMustacheFct),
          buildHash: buildMustacheFct(buildHashMustacheFct)
        };
				
				var html = mustache.render(template, templateData);
				callback(html);
			});
		}

		function getTemplate(params, callback) {
			if(helper.isFunction(this.getTemplate))
		    return this.getTemplate(params, callback);

			webservice.loadTemplate(params).then(callback);
		}
		
		function getTemplateInfo() {
		  if(!helper.isFunction(this.getTemplateInfo))
		    return {name: this.name, mode: this.mode};
		  
      var info = this.getTemplateInfo();
      if(helper.isObject(info))
        return info;
      return {name: info, mode: this.mode};
		}
		
		function buildMustacheFct(fct) {
		  return function() {
		    return fct;
		  };
		}
		
		function getLanguageMustacheFct(text, render) {
	    var params = helper.extractParams(render(text), true);
	    
	    if(Object.keys(params).length === 1 && !params.key)
	      params.key = Object.keys(params)[0];
	    
	    text = lang.get(params.key, params, params.lang);
      return text;
		}
		
		function getLocalisationMustacheFct(text, render) {
	    var params = helper.extractParams(render(text), true);
	    
	    if(Object.keys(params).length === 1 && !params.key)
	      params.key = Object.keys(params)[0];
      
      if(params.fct === "get" || !params.fct) {
        text = loc.get(params.key, params.loc);
      }
      else {
        var array = [];
        if(params.arrayParams)
          array = helper.extractArray(params.arrayParams, true);
        text = loc[params.fct].apply(loc, array);
      }
      
      return text;
		}
		
		function buildHashMustacheFct(text, render) {
	    var params = helper.extractParams(render(text), true);
	    if(Object.keys(params).length === 1 && !params.page)
	      params = {page: Object.keys(params)[0]};
	    
	    return config.elaiJS.buildHash(params);
		}
		
		return plugin;
	};
});