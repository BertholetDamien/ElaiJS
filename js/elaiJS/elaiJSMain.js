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
    require([ "elaiJS/plugin", "elaiJS/widget", "elaiJS/primaryWidget",
              "elaiJS/mustacherend", "elaiJS/polymerend"]);
	}
	
	function initalizeModules(callback) {
	  initializeModule(navigator, undefined, config.elaiJS.skipNavigatorInitialization);
    
    var multiCallBackFunction = multicallback(3, callback);
    initializeModule(themeManager, multiCallBackFunction);
    initializeModule(lang, multiCallBackFunction, config.elaiJS.skipLanguageInitialization);
    initializeModule(loc, multiCallBackFunction, config.elaiJS.skipLocalisationInitialization);
	}
	
	function initializeModule(module, callback, skipInit) {
	  if(skipInit === true) {
	    if(helper.isFunction(callback))
	      callback();
      return;
	  }
	  
    module.initialize(callback);
	}
	
	function start() {
	  if(config.elaiJS.requireElaiJS)
      config.elaiJS.requireElaiJS.setConfig(config);
    
    if(console && console.timeEnd && config.elaiJS.isDebug)
      console.timeEnd("ElaiJS Start in");
	  
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
  Promise pour webservice
  Ajouter catch Error pour les webservices
  Ajouter 'on' for binder
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