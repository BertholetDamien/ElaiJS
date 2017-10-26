define(["elaiJS/helper", "elaiJS/binder", "elaiJS/promise",
        "elaiJS/propertiesManagerFactory", "elaiJS/configuration",
        "elaiJS/ressources", "elaiJS/mode", "elaiJS/navigator",
        "elaiJS/webservice", "elaiJS/defaultWebservices",
        "elaiJS/defaultConfiguration", "elaiJS/theme",
        "elaiJS/language", "elaiJS/localisation"],
        function(helper, b, Promise, p, config, r, m, navigator,
          w, defaultWebservices, defaultConfig, themeManager, lang, loc) {

	function initialize() {
	  loadWidgetModules();

    defaultWebservices.addDefaultWebservices();
	  defaultConfig.setDefaultConfiguration().then(function() {
	    launchDebugMode();
	    initalizeModules().then(start);
	  });
	}

	function loadWidgetModules() {
    require([ "elaiJS/plugin", "elaiJS/widget", "elaiJS/primaryWidget",
              "elaiJS/mustacherend", "elaiJS/polymerend"]);
	}

	function initalizeModules() {
	  initializeModule(navigator, config.elaiJS.skipNavigatorInitialization);

    return Promise.all([
    	initializeModule(themeManager),
    	initializeModule(lang, config.elaiJS.skipLanguageInitialization),
    	initializeModule(loc, config.elaiJS.skipLocalisationInitialization)
    ]);
	}

	function initializeModule(module, skipInit) {
	  if(skipInit === true)
      return Promise.resolve();

    return module.initialize();
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
  Ajouter 'on' and 'emit' for binder
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
