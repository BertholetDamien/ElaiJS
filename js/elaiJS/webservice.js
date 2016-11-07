define(["elaiJS/configuration", "elaiJS/binder", "elaiJS/helper", "elaiJS/promise"],
				function(config, binder, helper, Promise) {
	'use strict';
	
	var self = {};
	var keywords;
	
	function checkKeywords(name) {
		if(keywords.indexOf(name) !== -1)
			throw new Error("You can't use a Keyword: '" + name + "'");
	}
	
	self.addService = function addService(name, executeFunction, defaultServiceParams) {
		checkKeywords(name);
		
		var service = function(params, serviceParams) {
			return execute(buildContext(service, params, serviceParams));
		};
		
		service.execute = executeFunction;
		service.defaultServiceParams = defaultServiceParams;
		service.id = name.toLowerCase();
		service.interceptors = {
			before: {add: addInterceptor, remove: removeInterceptor, list: []},
			after: 	{add: addInterceptor, remove: removeInterceptor, list: []}
		};
		service.cache = [];
		service.currents = [];
		service.removeCache = removeCache;
		binder.addBindFunctions(service);
		
		return self[name] = service;
	}
	
	function buildContext(service, params, serviceParams) {
		return {
			service: service,
			params: params || {},
			serviceParams: buildServiceParams(service, serviceParams || {})
		};
	}
	
	function buildServiceParams(service, serviceParams) {
		config.call(serviceParams, service.defaultServiceParams, true);
		config.call(serviceParams, config.elaiJS.defaultServiceParams, true);
		return serviceParams;
	}
	
	function execute(context) {
		binder.fire.call(context.service, "before", context);
		
		var promise = Promise.resolve(context);
		promise = chainInterceptors(context, promise, context.service.interceptors.before.list);
		promise = promise.then(executeService);
		promise = chainInterceptors(context, promise, context.service.interceptors.after.list);
		
		return promise.then(finalizeExecute, finalizeExecuteWithError);
	}
	
	function finalizeExecute(context) {
		binder.fire.call(context.service, "after", context);
		binder.fire.call(context.service, "success", context);
		return context.result;
	}
	
	function finalizeExecuteWithError(context) {
		binder.fire.call(context.service, "after", context);
		binder.fire.call(context.service, "error", context);
		throw context.error;
	}
	
	function chainInterceptors(context, promise, interceptors) {
		for(var i in interceptors) {
			promise = promise.then(interceptors[i].callback, interceptors[i].errCallback);
			promise = promise.catch(manageInterceptorError);
		}
		
		function manageInterceptorError(error) {
			if(error !== context)
				context.error = error;
			throw context;
		}
		
		return promise;
	}
	
	function executeService(context) {
		var promise;
		if(context.serviceParams.searchInCache)
			promise = searchInCacheOrFuturCache(context);
		
		if(!promise) {
			var paramsClone = helper.clone(context.params);
			promise = new Promise(function(resolve, reject) {
				var result = context.service.execute(context.params, resolve, reject, context);
				if(result && helper.isFunction(result.then))
					result.then(resolve, reject);
			});
			
			if(context.serviceParams.useCache)
				addToCurrent(context, promise, paramsClone);
		}
		
		return promise.then(function(result) {
			context.result = result;
			return context;
		}, function(error) {
			context.error = error;
			throw context;
		});
	}
	
	function searchInCacheOrFuturCache(context) {
		var cacheResult = findInCache(context);
		if(cacheResult)
			return Promise.resolve(cacheResult.result);
		
		return findInCurrent(context);
	}
	
	/******************************************************************
	************************** Interceptor ***************************
	******************************************************************/
	function addInterceptor(callback, errCallback) {
		var interceptor = {
			callback: callback,
			errCallback: errCallback
		};
		this.list.push(interceptor);
		return interceptor;
	}
	
	function removeInterceptor(interceptor) {
		if(helper.isObject(interceptor))
			this.list.splice(this.list.indexOf(interceptor), 1);
		else
			this.list = [];
		
		return self;
	}
	
	/******************************************************************
	************************* Utils Current **************************
	******************************************************************/
	function addToCurrent(context, promise, params) {
		var obj = {
			promise: promise,
			params: params
		};
		context.service.currents.push(obj);
		
		promise.then(function(result) {
			addToCache(context, params, result);
			deleteCurrentObj(context.service, obj);
		}, function() {
			deleteCurrentObj(context.service, obj);
		});
	}
	
	function findInCurrent(context) {
		var currentObjs = context.service.currents;
		for(var i in currentObjs) {
			if(helper.equals(context.params, currentObjs[i].params, false))
				return currentObjs[i].promise;
		}
	}
	
	function deleteCurrentObj(service, currentObj) {
		service.currents.splice(service.currents.indexOf(currentObj), 1);
	}
	
	/******************************************************************
	************************** Utils Cache ***************************
	******************************************************************/
	function findInCache(context, params) {
		var cacheObjects = context.service.cache;
		for(var i in cacheObjects) {
			if(helper.equals(params || context.params, cacheObjects[i].params, false))
				return cacheObjects[i];
		}
	}
	
	function addToCache(context, params, result) {
		var cache = context.service.cache;
		
		var inCache = findInCache(context, params);
		if(inCache)
			cache.splice(cache.indexOf(inCache), 1);
		
		cache.push({params: params, result: result});
	}
	
	function removeCache() {
		this.cache = [];
	}
	
	keywords = Object.keys(self);
	
	return self;
});