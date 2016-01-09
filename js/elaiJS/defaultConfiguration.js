define(["elaiJS/configuration", "elaiJS/webservice", "elaiJS/helper"],
        function(config, webservice, helper) {
	'use strict';

  var applicationConfig;
	var self = {};

	self.resetConfiguration = function resetConfiguration() {
	  var keys = Object.keys(config);
		for(var i in keys)
		  delete config[keys[i]];
	};
	
	self.setDefaultConfiguration = function setDefaultConfiguration(callback) {
    self.resetConfiguration();
    
    setDefaultBasicConfiguration();
    setAppConfigurationFile(function() {
      setDefaultConditionalConfiguration();
      if(callback)
        callback();
    });
	};
	
	function setDefaultBasicConfiguration() {
	  config.debugMode = isDebugMode();
	  config.requireElaiJS = window.requireElaiJS;
	  
	  config.homePage = "home";
	  config.defaultParentWidget = "elaiJS/primaryWidget";
    config.defaultTheme = "default";
    config.defaultMode = undefined;
    config.defaultLanguage = "en";
    config.autoFindLanguage = true;
    config.mustacheLib = "lib/mustache.min";
    
    config.defaultLocalisation = "en-US";
    config.autoFindLocalisation = true;
    config.matchValidLocalisation = {
      "fr": "fr-FR",
      "en": "en-US"
    };
    config.storagePath = location.pathname.split(".")[0].substring(1).replace(/\//g, "_");
    
    config.ressources = {
      ressources: "ressources",
      javascript: "js",
      css: "css",
      
      themes: "{{css}}/themes",
      theme: "{{themes}}/{{name}}.css",
      languages: "{{ressources}}/languages",
      language: "{{languages}}/language_{{name}}.properties",
      localisations: "{{ressources}}/localisations",
      localisation: "{{localisations}}/localisation_{{name}}.json",
      
      plugins: "plugins",
      plugin: "{{plugins}}/{{name}}",
      pluginMode: "{{plugins}}/{{name}}-{{mode}}",
      
      widgets: "widgets",
      widget: "{{widgets}}/{{name}}",
      widgetMode: "{{widgets}}/{{name}}-{{mode}}",
      
      templates: "templates",
      template: "{{templates}/{{name}}.tpl",
      templateMode: "{{templates}}/{{name}}-{{mode}}.tpl",
      widgetsCSS: "{{css}}/widgets",
      widgetCSS: "{{widgetsCSS}}/{{name}}.css",
      widgetCSSMode: "{{widgetsCSS}}/{{name}}-{{mode}}.css"
    };
    
    config.debugModules = {
      "elaiJS/binder": "binder",
      "elaiJS/cascadeCaller": "cascadeCaller",
      "elaiJS/configuration": "config",
      "elaiJS/defaultConfiguration": "defaultConfiguration",
      "elaiJS/defaultWebservices": "defaultWebservices",
      "elaiJS/helper": "helper",
      "elaiJS/language": "lang",
      "elaiJS/localisation": "localisation",
      "elaiJS/mode": "modeManager",
      "elaiJS/multicallback": "multicallback",
      "elaiJS/navigator": "historyNavigator",
      "elaiJS/plugin": "pluginManager",
      "elaiJS/propertiesManagerFactory": "propertiesManagerFactory",
      "elaiJS/ressources": "ressources",
      "elaiJS/localStorage": "elaiStorage",
      "elaiJS/theme": "themeManager",
      "elaiJS/webservice": "webservice",
      "elaiJS/widget": "widgetManager"
  	};
	}
	
	function isDebugMode() {
    var debug = helper.getElaiJSAttribute("debug");
    debug = debug || helper.extractGetParams().debug;
    return debug == "true";
  }
	
	function setDefaultConditionalConfiguration() {
	  if(config.defaultTheme === "undefined")
	    config.defaultTheme = undefined;
	  
	  if(config.setDefaultNavigationFunctions === false)
	    return;
	 
	  config.buildHash = function defaultBuildHash(pageInfo) {
      var hash = "#" + pageInfo.page;
  
    	if(Object.keys(pageInfo).length > 1) {
    		 hash += "/";
    		 for(var key in pageInfo)
    		  if(key != "page")
  	        hash += key + "=" + pageInfo[key] + "&";
  
    		 hash = hash.substring(0, hash.length - 1);
    	}
  
      return hash;
    };
  
    config.extractPageInfo = function defaultExtractPageInfo(hash) {
      if(!hash || hash === "" || hash === "#")
        return {page: config.homePage};
      
      var tab = hash.split("/");
  	  var pageInfo = helper.extractParams(tab[1]);
      pageInfo.page = tab[0];
      
      return pageInfo;
    };
	}
	
	function setAppConfigurationFile(callback) {
    loadAppConfigurationFile(function(appConfig) {
      applicationConfig = appConfig;
      if(appConfig)
        config(appConfig);
      
      callback();	    
    });
  }
	
	function loadAppConfigurationFile(callback) {
    var urlFile = helper.getElaiJSAttribute("config");
    if(urlFile)
      webservice.loadJSONFile(urlFile, callback);
    else
      callback();
	}

	return self;
});