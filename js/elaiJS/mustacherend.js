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
      getHTML: getDisplayContent,
      getRefreshHTML: getDisplayContent,
      initialize: initialize
    };
    binder.addAllFunctions(rendererInfo);
    
    var plugin = {
      events: {
	      beforeCreate: beforeCreate
      }
		};
	  plugin = rendererFactory(rendererInfo, pluginInfo, plugin);
	  
		function initialize() {
			this.templateData = undefined;
			this.refreshTemplateData = undefined;
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
		function getDisplayContent(refreshMode) {
	    return getTemplateStuff.call(this, refreshMode).then(function(tplStuff) {
				return mustache.render(tplStuff.template, tplStuff.tplData, tplStuff.subTpls);
	    }.bind(this));
		}
		
		function getTemplateStuff(refreshMode) {
			return getTemplateInfo.call(this, refreshMode).then(function(params) {
				return getSubTemplates.call(this, refreshMode, params).then(function(subTpls) {
					return getTemplate.call(this, refreshMode, params).then(function(template) {
						return getTemplateData.call(this, refreshMode, params).then(function(tplData) {
							return {
								info: params,
								tplData: tplData,
								subTpls: subTpls,
								template: template
							};
						}.bind(this));
					}.bind(this));
				}.bind(this));
			}.bind(this));
		}

		function getTemplate(refreshMode, params) {
			return getAction.call(this, "Template", refreshMode, params).then(function(tpl) {
				if(tpl != undefined)
					return tpl;
				
				return webservice.loadTemplate(params);
			}.bind(this));
		}

		function getSubTemplates(refreshMode, params) {
			return getAction.call(this, "SubTemplates", refreshMode, params);
		}
		
		function getTemplateInfo(refreshMode) {
			return getAction.call(this, "TemplateInfo", refreshMode).then(function(info) {
				if(!info)
					return {name: this.name, mode: this.mode, refreshMode: refreshMode};
				
				if(helper.isObject(info))
        	return info;
      	return {name: info, mode: this.mode, refreshMode: refreshMode};
			}.bind(this));
		}

		function getTemplateData(refreshMode) {
			var defaultTplData = {
				widget: this,
				w: this,
				data: refreshMode ? this.refreshTemplateData : this.templateData,
				config: config,
				lang: buildMustacheFct(getLanguageMustacheFct),
				loc: buildMustacheFct(getLocalisationMustacheFct),
				buildHash: buildMustacheFct(buildHashMustacheFct)
			};

			return getAction.call(this, "TemplateData", refreshMode, defaultTplData).then(function(templateData) {
      	return templateData || defaultTplData;
			}.bind(this));
		}
		
		function getAction(name, refreshMode, params) {
			var refreshName = refreshMode ? "Refresh" : "";
			var actionName = "get" + refreshName + name;
			
			var promise = Promise.resolve();
			if(!helper.isFunction(this[actionName]))
				return promise;

	    return promise.then(function() {
	    	return this[actionName](params);
	    }.bind(this));
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