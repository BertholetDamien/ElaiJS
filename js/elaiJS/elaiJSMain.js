define([], function() {
  var config, defaultConfiguration, defaultWebservices, navigator,
      themeManager, lang, localisation, multicallback, helper;
  
	function initialize() {
	  loadModules(function() {
      defaultWebservices.addDefaultWebservices();
      
  	  defaultConfiguration.setDefaultConfiguration(function() {
  	    launchDebugMode();
  	    initalizeModules(loadAppMain);
  	  });
	  });
	}
	
	function loadModules(callback) {
	  require([ "elaiJS/helper", "elaiJS/binder", "elaiJS/cascadeCaller",
	            "elaiJS/multicallback", "elaiJS/propertiesManagerFactory",
	            "elaiJS/configuration", "elaiJS/ressources", "elaiJS/mode",
              "elaiJS/navigator", "elaiJS/webservice",
              "elaiJS/defaultWebservices","elaiJS/defaultConfiguration",
              "elaiJS/theme", "elaiJS/language", "elaiJS/localisation"
            ],
      function( helper2, a, b, multicallback2, c, config2, d, e, navigator2,
                f, defaultWebservices2, defaultConfig2, themeManager2,
                lang2, loc2) {
        config = config2;
        defaultConfiguration = defaultConfig2;
        defaultWebservices = defaultWebservices2;
        navigator = navigator2;
        themeManager = themeManager2;
        lang = lang2;
        localisation = loc2;
        multicallback = multicallback2;
        helper = helper2;
        
        callback();
    });
    
    require(["elaiJS/plugin", "elaiJS/widget", "elaiJS/primaryWidget"]);
	}
	
	function initalizeModules(callback) {
    themeManager.initialize();
    
    if(config.setDefaultNavigationFunctions !== false)
      navigator.initializeCurrentPage();
    
    var multiCallBackFunction = multicallback(2, callback);
    lang.initialize(multiCallBackFunction);
    localisation.initialize(multiCallBackFunction);
	}
	
	function loadAppMain() {
    if(config.requireElaiJS)
      config.requireElaiJS.setConfig(config);
    
	  var debug = config.debugMode ? "Debug" : "";
    var appModuleName = helper.getElaiJSAttribute("app" + debug);
    if(!appModuleName)
      return;
    
    var baseURL = helper.getElaiJSAttribute("baseurl");
    if(!baseURL && config.useRequireElaiJS) {
      var index = appModuleName.lastIndexOf("/");
      appModuleName = appModuleName.substring(index + 1, appModuleName.length);
    }
    
    if(console && console.timeEnd && config.debugMode)
      console.timeEnd("ElaiJS Start in");
	  
    require([appModuleName]);
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
  Test helper.isEmail
  
  IE/Edge
    StorageEvent don't work
  
  DefaultWebService
    Error management
  
  Integrate one of this View:
    Google Polymere
    Riot
    React
    X-Tag
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