define([	"elaiJS/configuration", "elaiJS/webservice",
					"elaiJS/helper", "elaiJS/promise"],
      		function(config, webservice, helper, Promise) {
	'use strict';

	var self = {};

	self.resetElaiJSConfiguration = function resetElaiJSConfiguration() {
    delete config.elaiJS;
	};
	
	self.setDefaultConfiguration = function setDefaultConfiguration(callback) {
    self.resetElaiJSConfiguration();
    
    setDefaultBasicConfiguration();
    
    setAppConfigurationFile(function() {
      setDefaultConditionalConfiguration();
      if(helper.isFunction(callback))
        callback();
    });
	};
	
	function setDefaultBasicConfiguration() {
	  var elaiJS = {};
	  config.elaiJS = elaiJS;
	  config.elaiJS.require = {paths: {}, shim: {}};
	  
	  elaiJS.isDebug = isDebugMode();
	  elaiJS.requireElaiJS = window.requireElaiJS;
	  
	  elaiJS.homePage = "home";
	  elaiJS.defaultParentWidget = "elaiJS/primaryWidget";
    elaiJS.defaultTheme = undefined;
    elaiJS.defaultMode = undefined;
    elaiJS.defaultLanguage = "en";
    elaiJS.autoFindLanguage = true;
    elaiJS.languageStorageKey = "language";
    elaiJS.localisationStorageKey = "localisation";
    elaiJS.mustacheLib = "lib/mustache.min";
    elaiJS.polymereLib = "../bower_components/webcomponentsjs/webcomponents-lite.min";
    
    elaiJS.defaultLocalisation = "en-US";
    elaiJS.autoFindLocalisation = true;
    elaiJS.matchValidLocalisation = {
      "fr": "fr-FR",
      "en": "en-US"
    };
    elaiJS.storagePath = location.pathname.split(".")[0].substring(1).replace(/\//g, "_");
    
   	elaiJS.defaultServiceParams = {useCache: false, searchInCache: true};
    
    elaiJS.ressources = {
      ressources: "ressources",
      javascript: "js",
      css:        "css",
      
      themes:         "{{css}}/themes",
      theme:          "{{themes}}/{{name}}.css",
      languages:      "{{ressources}}/languages",
      language:       "{{languages}}/language_{{name}}.properties",
      localisations:  "{{ressources}}/localisations",
      localisation:   "{{localisations}}/localisation_{{name}}.json",
      
      plugins:    "plugins",
      plugin:     "{{plugins}}/{{name}}",
      pluginMode: "{{plugins}}/{{name}}-{{mode}}",
      
      widgets:    "widgets",
      widget:     "{{widgets}}/{{name}}",
      widgetMode: "{{widgets}}/{{name}}-{{mode}}",
      
      templates:      "templates",
      template:       "{{templates}}/{{name}}.tpl",
      templateMode:   "{{templates}}/{{name}}-{{mode}}.tpl",
      widgetsCSS:     "{{css}}/widgets",
      widgetCSS:      "{{widgetsCSS}}/{{name}}.css",
      widgetCSSMode:  "{{widgetsCSS}}/{{name}}-{{mode}}.css"
    };
    
    elaiJS.debugModules = {
      "elaiJS/binder":                    "binder",
      "elaiJS/cascadeCaller":             "cascadeCaller",
      "elaiJS/configuration":             "config",
      "elaiJS/defaultConfiguration":      "defaultConfiguration",
      "elaiJS/defaultWebservices":        "defaultWebservices",
      "elaiJS/helper":                    "helper",
      "elaiJS/language":                  "lang",
      "elaiJS/localisation":              "localisation",
      "elaiJS/mode":                      "modeManager",
      "elaiJS/multicallback":             "multicallback",
      "elaiJS/navigator":                 "navigatorElai",
      "elaiJS/plugin":                    "pluginManager",
      "elaiJS/propertiesManagerFactory":  "propertiesManagerFactory",
      "elaiJS/ressources":                "ressources",
      "elaiJS/localStorage":              "localStorageElai",
      "elaiJS/theme":                     "themeManager",
      "elaiJS/webservice":                "webservice",
      "elaiJS/widget":                    "widgetManager",
      "elaiJS/promise":                   "PromiseElai"
  	};
	}
	
	function isDebugMode() {
    var debug = helper.getElaiJSAttribute("debug");
    debug = debug || helper.extractGetParams().debug;
    return debug == "true";
  }
	
	function setDefaultConditionalConfiguration() {
	  var elaiJS = config.elaiJS;
	  if(elaiJS.defaultTheme === "undefined")
	    elaiJS.defaultTheme = undefined;
	    
    if(elaiJS.version === undefined)
      elaiJS.version = helper.getElaiJSAttribute("version");

    if( elaiJS.requireElaiJS
        && elaiJS.version
        && (!elaiJS.require || !elaiJS.require.urlArgs)) {
      if(!elaiJS.require)
        elaiJS.require = {};
      
      elaiJS.require.urlArgs = "v=" + elaiJS.version;
    }
	  
	  if(elaiJS.setDefaultNavigationFunctions === false)
	    return;
	 
	  elaiJS.buildHash = function defaultBuildHash(pageInfo) {
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
  
    elaiJS.extractPageInfo = function defaultExtractPageInfo(hash) {
      if(!hash || hash === "" || hash === "#")
        return {page: elaiJS.homePage};
      
      var tab = hash.split("/");
  	  var pageInfo = helper.extractParams(tab[1]);
      pageInfo.page = tab[0];
      
      return pageInfo;
    };
    
    elaiJS.showInternalBeforeUnloadMessage = function(message, callback) {
      callback(confirm(message));
    };
	}
	
	function setAppConfigurationFile(callback) {
    loadAppConfigurationFile().then(function(appConfig) {
      if(appConfig)
        config(appConfig);
      callback();
    }, callback);
  }
	
	function loadAppConfigurationFile() {
    var urlFile = helper.getElaiJSAttribute("config");
    if(urlFile)
      return webservice.loadJSONFile(urlFile);
    return Promise.resolved();
	}

	return self;
});