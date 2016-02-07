(function(scope) {
  if(console && console.time)
    console.time("ElaiJS Start in");
  
  if(scope.define && scope.define.amd)
    return scope.require(["elaiJS/elaiJSMain"]);
  
  var baseURL;
  var waitModules = [];
  var modules = {};
  var listeners = {};
  var config;
  
  function initialize() {
    baseURL = getBaseURL();
    loadMain();
  }
  
  function loadMain() {
    var mainModuleName = getElaiJSAttribute("main");
    if(mainModuleName)
      scope.require([mainModuleName]);
  }
  
  function getBaseURL() {
    var baseURL = getElaiJSAttribute("baseUrl");
    if(baseURL)
      return baseURL;
    
    var appModuleName = getElaiJSAttribute("app") || getElaiJSAttribute("appDebug");
    if(!appModuleName)
      return ".";
    
    var index = appModuleName.lastIndexOf("/");
    return appModuleName.substring(0, index);
  }
  
  function getElaiJSAttribute(name) {
    var urlFile;
    var scriptElement = document.getElementsByClassName("elaiJS");
    if(scriptElement && scriptElement.length > 0)
      urlFile = scriptElement[0].getAttribute("data-" + name);
    
    if(urlFile === "")
      return undefined;
      
    return urlFile;
	}
  
  function loadScript(moduleName) {
    var node = createNode(moduleName);
    document.getElementsByTagName("head")[0].appendChild(node);
  }
  
  function getScriptURL(moduleName) {
    if( config && config.require && config.require.paths &&
        config.require.paths[moduleName]) {
      moduleName = config.require.paths[moduleName];
    }
    
    if(moduleName.indexOf(".js") >= 0)
      return moduleName;
    
    var url = baseURL + "/" + moduleName + ".js";
    if(config && config.require && config.require.urlArgs)
      url += "?" + config.require.urlArgs;
    
    return url;
  }
  
  function createNode(moduleName) {
    var node = document.createElement('script');
    node.type = 'text/javascript';
    node.charset = 'utf-8';
    node.async = true;
    
    node.id = "requireElaiJS_module_" + moduleName;
    node.classList.add("requireElaiJS_module");
    node.setAttribute('data-moduleName', moduleName);
    node.addEventListener('load', onScriptLoad, false);
    node.addEventListener('error', onScriptError, false);
    node.src = getScriptURL(moduleName);
    
    return node;
  }
  
  function onScriptLoad() {
    var moduleName = this.getAttribute("data-moduleName");
    var moduleDef = waitModules.shift();
    if(moduleDef)
      scope.define(moduleName, moduleDef.deps, moduleDef.callback);
    else
      addModule(moduleName, null);
  }
  
  function onScriptError(error) {
    var moduleName = this.getAttribute("data-moduleName");
    callErrorListener(error, moduleName);
    
    throw new Error("Error: Script error during loading module '" + moduleName + "'");
  }
  
  function internalDefine(name, deps, callback) {
    if(typeof callback === "object") {
      addModule(name, callback);
      return;
    }
    
    scope.require(deps, function() {
      var module = callback.apply(scope, arguments);
      var index = checkExportsIndex(deps);
      module = (index === undefined) ? module : arguments[index];
      
      addModule(name, module);
    });
  }
  
  function checkExportsIndex(deps) {
    for(var i in deps)
      if(deps[i] === "exports")
        return i;
  }
  
  function addWaitModule(deps, callback) {
    waitModules.push({deps: deps, callback: callback});
  }
  
  function addModule(name, module) {
    if(modules[name]) {
      callListener(name, module);
      return;
    }
    
    modules[name] = module;
    callListener(name, module);
    callShimInit(name);
  }
  
  function getModule(name, callback, errCallback) {
    if(modules[name] !== undefined) {
      if(callback)
        callback(modules[name], name);
      return modules[name];
    }
    
    if(!callback)
      throw new Error("Module '" + name + "' has not been loaded.");
   
    if(name === "exports")
      return (callback) ? callback({}, name) : undefined;
    
    var newListener = addListener(name, callback, errCallback);
    if(newListener)
      loadScript(name);
  }
  
  function addListener(name, callback, errCallback) {
    var newListener = true;
    if(!listeners[name])
      listeners[name] = [];
    else
      newListener = false;
    
    listeners[name].push({callback: callback, errCallback: errCallback});
    return newListener;
  }
  
  function callListener(moduleName, module) {
    if(!listeners[moduleName])
      return;
    
    for(var i in listeners[moduleName])
      listeners[moduleName][i].callback(module, moduleName);
      
    delete listeners[moduleName];
  }
  
  function callErrorListener(error, moduleName) {
    if(!listeners[moduleName])
      return;
    
    for(var i in listeners[moduleName]) {
      if(listeners[moduleName][i].errCallback)
        listeners[moduleName][i].errCallback(error, moduleName);
    }
    
    delete listeners[moduleName];
  }
  
  function callShimInit(moduleName) {
    if( !config
        || !config.require
        || !config.require.shim
        || !config.require.shim[moduleName]
        || !config.require.shim[moduleName].init)
      return;
    
    config.require.shim[moduleName].init();
  }
  
  function getModules(modulesName, callback, errCallback) {
    var modulesDep = {};
    var count = modulesName.length;
    var getModuleCallback = function getModuleCallback(module, name) {
      --count;
      modulesDep[name] = module;
      
      if(count === 0) {
        var deps = sortModules(modulesName, modulesDep);
        if(callback)
          callback.apply(scope, deps);
      }
    };
    
    for(var i in modulesName)
      getModule(modulesName[i], getModuleCallback, errCallback);
    
    if(modulesName.length === 0)
      callback();
  }
  
  function sortModules(modulesName, modulesObj) {
    var modulesDeps = [];
    
    for(var i in modulesName)
      modulesDeps.push(modulesObj[modulesName[i]]);
      
    return modulesDeps;
  }
  
  function getIndirectDeps(modulesName) {
    if(!config || !config.require || !config.require.shim)
      return [];
      
    var shim = config.require.shim;
    var deps = [];
    for(var i in modulesName) {
      var moduleLoadDef = shim[modulesName[i]];
      if(moduleLoadDef && moduleLoadDef.deps) {
        deps = deps.concat(moduleLoadDef.deps);
      }
    }
    
    if(deps.length > 0)
      return getIndirectDeps(deps).concat(deps);
    return [];
  }
  
  /************************************************************
   ********************* Scope functions **********************
  *************************************************************/
  scope.require = function require(deps, callback, errCallback) {
    if(typeof deps === 'string')
      return getModule(deps);
    
    var indirectDeps = getIndirectDeps(deps);
    getModules(indirectDeps, function() {
      getModules(deps, callback, errCallback);
    }, errCallback);
  };
  
  scope.define = function define(name, deps, callback) {
    if(typeof name === "string" && !callback) {
      callback = deps;
      deps = [];
    }
    
    if(!callback) {
      if(!deps) {
        deps = name;
        name = [];
      }
      
      addWaitModule(name, deps);
      return;
    }
    
    internalDefine(name, deps, callback);
  };
  
  scope.requireElaiJS = {};
  scope.requireElaiJS.setConfig = function(newConfig) {
    config = newConfig;
  };
  
  scope.requireElaiJS.undef = function(name) {
    delete modules[name];
    var node = document.getElementById("requireElaiJS_module_" + name);
    if(node && node.parentNode)
      node.parentNode.removeChild(node);
  };
  
  scope.requireElaiJS.undefAll = function(excepts) {
    for(var key in modules) {
      var except = false;
      for(var i in excepts) {
        if(key === excepts[i]) {
          except = true;
          break;
        }
      }
      
      if(!except)
        scope.requireElaiJS.undef(key);
    }
  };
  
  scope.define.amd = {jQuery: true};
  
  initialize();
}(this));