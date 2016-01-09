define(["elaiJS/binder", "elaiJS/cascadeCaller", "elaiJS/helper"],
          function(binder, cascadeCaller, helper) {
	'use strict';

	var self = {};

	var keywords = [  "addService", "setDefaultUseCache",
	                  "addBeforeListener", "addAfterListener",
	                  "removeBeforeListener", "removeAfterListener",
	                  "addBeforeInterceptor", "addAfterInterceptor",
	                  "removeBeforeInterceptor", "removeAfterInterceptor"
	               ];
	var services = {};
	var cache = {};
  var currents = {};

	self.addService = function addService(name, executeFonction, defaultUseCache) {
    checkKeywords(name);
	  
    var service = createService(name, executeFonction, defaultUseCache);
    services[service.name] = service;
    delete cache[service.name];
	  
    self[name] = function(params, callback, serviceParams) {
      callback = callback || function() {};
      process(service, params, callback, serviceParams || {});
    };
	};
	
	function createService(name, executeFunction, useCache) {
    return {
        execute: executeFunction,
        useCache: useCache || false,
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
	
	self.setDefaultUseCache = function setDefaultUseCache(name, defaultUseCache) {
    getService(name).useCache = defaultUseCache;
	};
	
	function getService(name) {
    var service = services[name.toLowerCase()];
    if(!service)
      throw new Error("WebService '" + name + "' doesn't exist.");
    
    return service;
	}
	
  function process(service, params, callback, serviceParams) {
    setDefaultServiceParams(service, serviceParams);
    
    var beforeExecuteCallback = function(params2, serviceParams2) {
      params = params2;
      serviceParams = serviceParams2;
      
      binder.fire.call(service, "before", {params: params, serviceParams: serviceParams});
      execute(service, params, executeCallback, serviceParams);
    };
    
    var executeCallback = function() {
      executeAfterInterceptor(service, params, afterInterceptorCallback, serviceParams, arguments);
    };
    
    var afterInterceptorCallback = function(params, serviceParams, result) {
      binder.fire.call(service, "after", {params: params, serviceParams: serviceParams, result: result});
      callback.apply(service, result);
    };
    
    executeBeforeInterceptor(service, params, beforeExecuteCallback, serviceParams);
	}
	
	function setDefaultServiceParams(service, serviceParams) {
	  if(serviceParams.useCache === undefined)
      serviceParams.useCache = service.useCache;
    
    if(serviceParams.searchInCache === undefined)
      serviceParams.searchInCache = true;
	}
	
	function executeBeforeInterceptor(service, params, callback, serviceParams) {
    var interceptors = service.interceptors.before;
    cascadeCaller(interceptors, [params, serviceParams], callback, service);
	}
	
	function executeAfterInterceptor(service, params, callback, serviceParams, result) {
    var interceptors = service.interceptors.after;
    cascadeCaller(interceptors, [params, serviceParams, result], callback, service);
	}
	
	function execute(service, params, callback, serviceParams) {
    if(serviceParams.searchInCache) {
      var find = searchInCacheOrFuturCache(service, params, callback);
      if(find === true)
        return;
    }
    
    var initialParams = helper.clone(params);
    var currentObj;
    if(serviceParams.useCache)
      currentObj = addToCurrent(service, initialParams, callback);
    
    service.execute(params, function() {
      if(serviceParams.useCache) {
        addToCache(service, initialParams, arguments);
        fireCurrentObj(currentObj, arguments);
      }
	    
      callback.apply(service, arguments);
    });
	}
	
	function searchInCacheOrFuturCache(service, params, callback) {
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
      
      return true;
    }
	}
	
	/******************************************************************
	 *************************** Listener *****************************
	******************************************************************/
	self.addBeforeListener = function addBeforeListener(name, callback) {
    addListener("before", name, callback);
	};
	
	self.addAfterListener = function addAfterListener(name, callback) {
    addListener("after", name, callback);
	};
	
	function addListener(eventCode, name, callback) {
    binder.bind.call(getService(name), eventCode, callback);
	}
	
	self.removeBeforeListener = function removeBeforeListener(name, callback) {
    removeListener("before", name, callback);
	};
	
	self.removeAfterListener = function removeAfterListener(name, callback) {
    removeListener("after", name, callback);
	};
	
	function removeListener(eventCode, name, callback) {
    binder.unbind.call(getService(name), eventCode, callback);
	}
	
	/******************************************************************
	 ************************** Interceptor ***************************
	******************************************************************/
	self.addBeforeInterceptor = function addBeforeInterceptor(name, callback) {
    addInterceptor("before", name, callback);
	};
	
	self.addAfterInterceptor = function addAfterInterceptor(name, callback) {
    addInterceptor("after", name, callback);
	};
	
	function addInterceptor(type, name, callback) {
	  var service = getService(name);
    service.interceptors[type].push(callback);
	}
	
	self.removeBeforeInterceptor = function removeBeforeInterceptor(name, callback) {
    removeInterceptor("before", name, callback);
	};
	
	self.removeAfterInterceptor = function removeAfterInterceptor(name, callback) {
    removeInterceptor("after", name, callback);
	};
	
	function removeInterceptor(type, name, callback) {
	  var service = getService(name);
    
    if(callback) {
      var index = service.interceptors[type].indexOf(callback);
      service.interceptors[type].splice(index, 1);
    }
    else {
      service.interceptors[type] = [];
    }
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
    
    cache[name].push({params: params, result: result});
	}
	
	return self;
});