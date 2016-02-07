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
	    initalizeModules(loadAppMain);
	  });
	}
	
	function loadWidgetModules() {
    require(["elaiJS/plugin", "elaiJS/widget", "elaiJS/primaryWidget"]);
	}
	
	function initalizeModules(callback) {
    themeManager.initialize();
    
    if(config.setDefaultNavigationFunctions !== false)
      navigator.initializeCurrentPage();
    
    var multiCallBackFunction = multicallback(2, callback);
    initializeModule(lang, multiCallBackFunction, config.skipLanguageInitialization);
    initializeModule(loc, multiCallBackFunction, config.skipLocalisationInitialization);
	}
	
	function initializeModule(module, callback, needInit) {
	  if(needInit !== true)
      module.initialize(callback);
    else
      callback();
	}
	
	function loadAppMain() {
    if(config.requireElaiJS)
      config.requireElaiJS.setConfig(config);
    
	  var debug = config.debugMode ? "Debug" : "";
	  // TODO remove debug ?
    var appModuleName = helper.getElaiJSAttribute("app" + debug);
    if(!appModuleName)
      return;
    
    var baseURL = helper.getElaiJSAttribute("baseurl");
    if(!baseURL && config.requireElaiJS) {
      var index = appModuleName.lastIndexOf("/");
      appModuleName = appModuleName.substring(index + 1, appModuleName.length);
    }
    
    if(console && console.timeEnd && config.debugMode)
      console.timeEnd("ElaiJS Start in");
	  
    require([appModuleName], function(appMain) {
      if(appMain && helper.isFunction(appMain.start))
        appMain.start();
    });
  }
  
  function launchDebugMode() {
    if(config.debugMode) {
      require(["elaiJS/debugManager"], function(debugManager) {
        debugManager.startDebugMode();
      });
    }
  }
  
  initialize();
  
  return {};
});

/*
  IE/Edge
    StorageEvent don't work
  
  Clean elaiJSMain
  Utiliser les workers?
  
  Integrate one or more of this View:
    Google Polymer
    Angular 2
    X-Tag
    Riot
    React
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