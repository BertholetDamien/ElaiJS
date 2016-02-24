define(["elaiJS/helper", "elaiJS/binder", "elaiJS/cascadeCaller",
        "elaiJS/multicallback", "elaiJS/propertiesManagerFactory",
        "elaiJS/configuration", "elaiJS/ressources", "elaiJS/mode",
        "elaiJS/navigator", "elaiJS/webservice",
        "elaiJS/defaultWebservices","elaiJS/defaultConfiguration",
        "elaiJS/theme", "elaiJS/language", "elaiJS/localisation"],
        function(helper, a, b, multicallback, c, config, d, e, navigator,
          f, defaultWebservices, defaultConfig, themeManager, lang, loc) {
  
	function initialize() {
	  loadWidgetModules();
	  
    defaultWebservices.addDefaultWebservices();
	  defaultConfig.setDefaultConfiguration(function() {
	    launchDebugMode();
	    initalizeModules(start);
	  });
	}
	
	function loadWidgetModules() {
    require(["elaiJS/plugin", "elaiJS/widget", "elaiJS/primaryWidget"]);
	}
	
	function initalizeModules(callback) {
    themeManager.initialize();
    
    if(config.elaiJS.skipNavigatorInitialization !== true)
      navigator.initializeCurrentPage();
    
    var multiCallBackFunction = multicallback(2, callback);
    initializeModule(lang, multiCallBackFunction, config.elaiJS.skipLanguageInitialization);
    initializeModule(loc, multiCallBackFunction, config.elaiJS.skipLocalisationInitialization);
	}
	
	function initializeModule(module, callback, needInit) {
	  if(needInit !== true)
      module.initialize(callback);
    else
      callback();
	}
	
	function start() {
	  if(config.elaiJS.requireElaiJS)
      config.elaiJS.requireElaiJS.setConfig(config);
    
    if(console && console.timeEnd && config.elaiJS.isDebug)
      console.timeEnd("ElaiJS Start in");
	  
    if(document.dispatchEvent && CustomEvent)
      document.dispatchEvent(new CustomEvent("ElaiJSReady"));
      
    loadAppMain();
	}
	
	function loadAppMain() {
    var appModuleName = helper.getElaiJSAttribute("app");
    if(!appModuleName)
      return;
    
    require([appModuleName], function(appMain) {
      if(appMain && helper.isFunction(appMain.start))
        appMain.start();
    });
  }
  
  function launchDebugMode() {
    if(config.elaiJS.isDebug) {
      require(["elaiJS/debugManager"], function(debugManager) {
        debugManager.startDebugMode();
      });
    }
  }
  
  initialize();
  
  return {};
});

/*
  TODO:
    loadThemeAsPolymerMixin
    Tester avec ElaiJSTest
*/

/*
  name
    Events - beforeName
    PluginsCall - nameBeforeWidget
    WidgetCall  - _name
    PluginsCall - nameAfterWidget
    ChildrenCallIsNeeded - name
    Events - afterName
*/