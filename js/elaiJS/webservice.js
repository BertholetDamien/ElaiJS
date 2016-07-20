define(["elaiJS/configuration", "elaiJS/binder", "elaiJS/cascadeCaller",
        "elaiJS/helper"],
        function(config, binder, cascadeCaller, helper) {
	'use strict';

	var self = {};

	var keywords;
	var services = {};
	var cache = {};
  var currents = {};
  
  var DEFAULT_SERVICE_PARAMS = {useCache: false, searchInCache: true};
  
  function initialize() {
    keywords = Object.keys(self);
  }
  
	self.addService = function addService(name, executeFonction, defaultServiceParams) {
    checkKeywords(name);
	  
    var service = createService(name, executeFonction, defaultServiceParams);
    services[service.name] = service;
    delete cache[service.name];
	  createAccessPoint(name, service);
    
    return self;
	};

  self.removeCache = function (name) {
    delete cache[getService(name).name];
  };
	
	function createAccessPoint(name, service) {
	  self[name] = function(params, initialCallback, initialErrCallback, serviceParams) {
	    serviceParams = buildServiceParams(service, serviceParams);
	    
      var callback = function() {
        var args = arguments;
        setTimeout(function() {
          if(helper.isFunction(initialCallback))
            initialCallback.apply(serviceParams.scope, args);
        });
      };
      
      var errCallback = function(e) {
        var args = arguments;
        setTimeout(function() {
          if(helper.isFunction(initialErrCallback))
            initialErrCallback.apply(serviceParams.scope, args);
          else
            console.error("Error during execution of service %o: %o", name, e);
        });
      };
      
      process(service, params, callback, errCallback, serviceParams);
    };
	}
	
	function createService(name, executeFunction, defaultServiceParams) {
    return {
        execute: executeFunction,
        defaultServiceParams: defaultServiceParams,
        name: name.toLowerCase(),
        displayName: name,
        interceptors: {before: [], after: []}
    };
	}
	
	function checkKeywords(name) {
    for(var i in keywords) {
      if(name.toLowerCase() === keywords[i].toLowerCase())
        throw new Error("You can't use a Keyword: '" + name + "'");
    }
	}
	
	self.setDefaultServiceParams = function setDefaultServPar(name, defaultServiceParams) {
    getService(name).defaultServiceParams = defaultServiceParams;
    return self;
	};
	
	function getService(name) {
    var service = services[name.toLowerCase()];
    if(!service)
      throw new Error("WebService '" + name + "' doesn't exist.");
    
    return service;
	}
	
  function process(service, params, callback, errCallback, serviceParams) {
    var beforeExecuteCallback = function(params2, serviceParams2) {
      params = params2;
      serviceParams = serviceParams2;
      
      binder.fire.call(service, "before", {params: params, serviceParams: serviceParams});
      execute(service, params, executeCallback, errCallback, serviceParams);
    };
    
    var executeCallback = function() {
      executeAfterInterceptor(service, params, afterInterceptorCallback, errCallback, serviceParams, arguments);
    };
    
    var afterInterceptorCallback = function(params, serviceParams, result) {
      binder.fire.call(service, "after", {params: params, serviceParams: serviceParams, result: result});
      callback.apply(service, result);
    };
    
    executeBeforeInterceptor(service, params, beforeExecuteCallback, errCallback, serviceParams);
	}
	
	function buildServiceParams(service, serviceParams) {
	  serviceParams = serviceParams || {};
    config.call(serviceParams, service.defaultServiceParams, true);
    config.call(serviceParams, DEFAULT_SERVICE_PARAMS, true);
    serviceParams.scope = serviceParams.scope || service;
    
    return serviceParams;
	}
	
	function executeBeforeInterceptor(service, params, callback, errCallback, serviceParams) {
    var interceptors = service.interceptors.before;
    cascadeCaller(interceptors, [params, serviceParams], callback, errCallback, service);
	}
	
	function executeAfterInterceptor(service, params, callback, errCallback, serviceParams, result) {
    var interceptors = service.interceptors.after;
    cascadeCaller(interceptors, [params, serviceParams, result], callback, errCallback, service);
	}
	
	function execute(service, params, callback, errCallback, serviceParams) {
    if(serviceParams.searchInCache) {
      var find = searchInCacheOrFuturCache(service, params, callback, errCallback);
      if(find === true)
        return;
    }
    
    var initialParams = helper.clone(params);
    var currentObj;
    if(serviceParams.useCache)
      currentObj = addToCurrent(service, initialParams, callback);
    
    function afterExecute() {
      if(serviceParams.useCache) {
        addToCache(service, initialParams, arguments);
        fireCurrentObj(currentObj, arguments);
      }
	    
      callback.apply(service, arguments);
    }
    
    function afterErrorExecute(exception) {
      if(serviceParams.useCache)
        fireErrorCurrentObj(currentObj, exception);
      errCallback.call(service, exception);
    }
    
    try {
      service.execute(params, afterExecute, afterErrorExecute);
    } catch(exception) {
      afterErrorExecute(exception);
    }
	}
	
	function searchInCacheOrFuturCache(service, params, callback, errCallback) {
    var cacheResult = findInCache(service, params);
    if(cacheResult) {
      callback.apply(service, cacheResult.result);
      return true;
    }
    
    var currentObj = findInCurrent(service, params);
    if(currentObj) {
      binder.bind.call(currentObj, "ready", function(event) {
        callback.apply(service, event.data);
      });
      
      binder.bind.call(currentObj, "error", function(event) {
        errCallback.apply(service, event.data);
      });
      
      return true;
    }
	}
	
	/******************************************************************
	 *************************** Listener *****************************
	******************************************************************/
	self.addBeforeListener = function (name, callback, params, scope, bindOne) {
    return addListener("before", name, callback, params, scope, bindOne);
	};
	
	self.addAfterListener = function (name, callback, params, scope, bindOne) {
    return addListener("after", name, callback, params, scope, bindOne);
	};
	
	function addListener(eventCode, name, callback, params, scope, bindOne) {
    return binder.bind.call(getService(name), eventCode, callback, params, scope, bindOne);
	}
	
	self.removeBeforeListener = function removeBeforeListener(name, callback) {
    return removeListener("before", name, callback);
	};
	
	self.removeAfterListener = function removeAfterListener(name, callback) {
    return removeListener("after", name, callback);
	};
	
	function removeListener(eventCode, name, callback) {
    return binder.unbind.call(getService(name), eventCode, callback);
	}
	
	/******************************************************************
	 ************************** Interceptor ***************************
	******************************************************************/
	self.addBeforeInterceptor = function addBeforeInterceptor(name, callback) {
    return addInterceptor("before", name, callback);
	};
	
	self.addAfterInterceptor = function addAfterInterceptor(name, callback) {
    return addInterceptor("after", name, callback);
	};
	
	function addInterceptor(type, name, callback) {
	  var service = getService(name);
    service.interceptors[type].push(callback);
    return self;
	}
	
	self.removeBeforeInterceptor = function removeBeforeInterceptor(name, callback) {
    return removeInterceptor("before", name, callback);
	};
	
	self.removeAfterInterceptor = function removeAfterInterceptor(name, callback) {
    return removeInterceptor("after", name, callback);
	};
	
	function removeInterceptor(type, name, callback) {
	  var service = getService(name);
    
    if(helper.isFunction(callback)) {
      var index = service.interceptors[type].indexOf(callback);
      service.interceptors[type].splice(index, 1);
    }
    else {
      service.interceptors[type] = [];
    }
    
    return self;
	}
	
	/******************************************************************
	 ************************* Utils Current **************************
	******************************************************************/
	function addToCurrent(service, params, callback) {
	  var name = service.name;
    if(!currents[name])
      currents[name] = [];
    
    var obj = {service: service, params: params, callback: callback};
    currents[name].push(obj);
    return obj;
	}
	
	function findInCurrent(service, params) {
    if(!currents[service.name])
      return;
    
    var currentObjs = currents[service.name];
    for(var i in currentObjs) {
      if(helper.equals(params, currentObjs[i].params, false))
        return currentObjs[i];
    }
	}
	
	function fireCurrentObj(currentObj, params) {
    binder.fire.call(currentObj, "ready", params);
    deleteCurrentObj(currentObj);
	}
	
	function fireErrorCurrentObj(currentObj, error) {
    binder.fire.call(currentObj, "error", error);
    deleteCurrentObj(currentObj);
	}
	
	function deleteCurrentObj(currentObj) {
    var currentObjs = currents[currentObj.service.name];
    for(var i in currentObjs) {
      if(currentObj === currentObjs[i]) {
        return currentObjs.splice(i, 1);
      }
    }
	}
	
	/******************************************************************
	 ************************** Utils Cache ***************************
	******************************************************************/
	function findInCache(service, params) {
    var name = service.name;
    if(!cache[name])
      return undefined;
    
    var cacheObjects = cache[name];
    for(var i in cacheObjects) {
      if(helper.equals(params, cacheObjects[i].params, false))
        return cacheObjects[i];
    }
	}
	
	function addToCache(service, params, result) {
    var name = service.name;
    if(!cache[name])
      cache[name] = [];

    var inCache = findInCache(service, params);
    if(inCache)
      cache[name].splice(cache[name].indexOf(inCache), 1);
    
    cache[name].push({params: params, result: result});
	}
	
	initialize();
	
	return self;
});