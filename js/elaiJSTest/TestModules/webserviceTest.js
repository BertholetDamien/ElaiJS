define(["elaiJS/webservice", "elaiJS/multicallback"],
            function(webservice, multicallback) {
	'use strict';
  var self = {};
  
  self.addSimpleService = function () {
    webservice.addService("testService", function() {
    });
    
    this.assert(webservice.testService);
    this.done();
  };
  
  self.keyword = function () {
    try {
      webservice.addService("AddService");
      this.error("KeyWord check");
    } catch(e) {
      this.done();
    }
  };
  
  self.simpleService = function (test) {
    var testValue = "ElaiJS";
    var testValue2 = "Framework";
    
    webservice.addService("testService", function(params, callback) {
      callback(testValue + testValue2);
    });
    
    webservice.testService(undefined).then(function(result) {
      test.assertEq((testValue + testValue2), result);
      test.done();
    });
  };
  
  self.simpleServiceWithParams = function (test) {
    var testValue = "ElaiJS";
    var testValue2 = "Framework";
    var testValue3 = "UI";
    
    webservice.addService("testService", function(params, callback) {
      callback(testValue + testValue2 + params.testValue3);
    });
    
    webservice.testService({testValue3: testValue3}).then(function(result) {
      test.assertEq((testValue + testValue2 + testValue3), result);
      test.done();
    });
  };
  
  self.serviceDefaultUseCache = function (test) {
    testServiceWithoutCache(test, undefined);
  };
  
  self.serviceWithoutCache = function (test) {
    testServiceWithoutCache(test, false);
  };
  
  function testServiceWithoutCache (test, defaultUseCache) {
    var testValue = "ElaiJS";
    var count = 0;
    
    webservice.addService("testService", function(params, callback) {
      ++count;
      
      callback(testValue);
    }, {useCache: defaultUseCache});
    
    var repeat = 4;
    callWebService("testService", {}, repeat, function() {
      test.assertEq(repeat, count);
      test.done();
    });
  }
  
  self.serviceWithCache = function (test) {
    var testValue = "ElaiJS";
    var count = 0;
    
    webservice.addService("testService", function(params, callback) {
      ++count;
      callback(testValue);
    }, {useCache: true});
    
    var repeat = 4;
    callWebService("testService", {}, repeat, function() {
      test.assertEq(1, count);
      test.done();
    });
  };
  
  self.resetCache = function (test) {
    var testValue = "ElaiJS";
    var count = 0;
    
    webservice.addService("testService", function(params, callback) {
      ++count;
      callback(testValue);
    }, {useCache: true});
    
    var repeat = 2;
    callWebService("testService", {}, repeat, function() {
      test.assertEq(1, count);
      test.done();
    });
  };
  
  self.removeCache = function (test) {
    var testValue = "ElaiJS";
    var count = 0;
    
    webservice.addService("testService", function(params, callback) {
      ++count;
      callback(testValue);
    }, {useCache: true});
    
    var repeat = 2;
    callWebService("testService", {}, repeat, function() {
      test.assertEq(1, count);
      
      webservice.testService.removeCache();
      callWebService("testService", {}, repeat, function() {
	      test.assertEq(2, count);
	      test.done();
	    });
    });
  };
  
  function callWebService(  name, params, count, callback, serviceParams,
                            test, resultValue) {
    var checkResult = function(result) {
      if(test && resultValue)
        test.assertEq(resultValue, result);
      multiCallBackFunction();
    };
      
    var multiCallBackFunction = multicallback(count, callback);
    for(var i = 0 ; i < count ; ++i)
      webservice[name](params, serviceParams).then(checkResult);
  }
  
  self.withUseCache = function (test) {
    var testValue = "ElaiJS";
    var count = 0;
    
    webservice.addService("testService", function(params, callback) {
      ++count;
      callback(testValue);
    });
    
    var repeat = 4;
    callWebService("testService", {}, repeat, function() {
      test.assertEq(1, count);
      test.done();
    }, {useCache: true});
  };
  
  self.withUseCacheAndSearchInCache = function (test) {
    var testValue = "ElaiJS";
    var count = 0;
    
    webservice.addService("testService", function(params, callback) {
      ++count;
      callback(testValue);
    });
    
    var repeat = 4;
    callWebService("testService", {}, repeat, function() {
      test.assertEq(repeat, count);
      test.done();
    }, {useCache: true, searchInCache: false});
  };
  
  self.setDefaultUseCase = function (test) {
    var testValue = "ElaiJS";
    var count = 0;
    
    webservice.addService("testService", function(params, callback) {
      ++count;
      callback(testValue);
    });
    
    var repeat = 4;
    callWebService("testService", {}, repeat, function() {
      test.assertEq(repeat, count);
      
      webservice.testService.defaultServiceParams = {useCache: true};
      callWebService("testService", {}, repeat, function() {
        test.assertEq((repeat + 1), count);
        test.done();
      });
    });
  };
  
  self.setDefaultSearchInParams = function (test) {
    var testValue = "ElaiJS";
    var count = 0;
    
    webservice.addService("testService", function(params, callback) {
      ++count;
      callback(testValue);
    }, {useCache: true});
    
    var repeat = 4;
    callWebService("testService", {}, repeat, function() {
      test.assertEq(1, count);
      
      webservice.testService.defaultServiceParams = {searchInCache: false};
      callWebService("testService", {}, repeat, function() {
        test.assertEq((repeat + 1), count);
        test.done();
      });
    });
  };
  
  self.setDefaultSearchInParams2 = function (test) {
    var testValue = "ElaiJS";
    var count = 0;
    
    webservice.addService("testService", function(params, callback) {
      ++count;
      callback(testValue);
    }, {useCache: true, searchInCache: false});
    
    var repeat = 4;
    callWebService("testService", {}, repeat, function() {
      test.assertEq(repeat, count);
      
      webservice.testService.defaultServiceParams = {searchInCache: true};
      callWebService("testService", {}, repeat, function() {
        test.assertEq(repeat, count);
        
        callWebService("testService", {}, repeat, function() {
          test.assertEq(repeat * 2, count);
          
          test.done();
        }, {searchInCache: false});
      });
    });
  };
  
  self.multiloading = function (test) {
    var testValue = "ElaiJS";
    var count = 0;
    
    webservice.addService("testService", function(params, callback) {
      setTimeout(function() {
        ++count;
        callback(testValue);
      }, 100);
    }, {useCache: true});
    
    var repeat = 5;
    callWebService("testService", {}, repeat, function() {
      test.assertEq(1, count);
      test.done();
    }, undefined, test, testValue);
  };
  
  self.addListenerUnknow = function (test) {
    try {
      webservice.getService("testServiceUnknow").bind("after", function() {});
      test.error("Add an unknow service need to be prevent.");
    } catch(e) {
      test.done();
    }
  };
  
  self.beforeListener = function (test) {
    var value = "";
    var testValue = "ElaiJS";
    var testValue2 = "ElaiJSParams";
    var testValue3 = "ElaiJsServiceParams";
    
    webservice.addService("testService", function(params, callback) {
      value += "b";
      callback(testValue);
    });
    
    webservice.testService.bind("before", function(event) {
      test.assertEq(event.data.params.testValue2, testValue2);
      test.assertEq(event.data.serviceParams.test, testValue3);
      value += "a";
    });
      
    var repeat = 1;
    callWebService("testService", {testValue2: testValue2}, repeat, function() {
      test.assertEq("ab", value);
      test.done();
    }, {test: testValue3}, test, testValue);
  };
  
  self.beforeListenerCache = function (test) {
    var testValue = "ElaiJS";
    var countListener = 0;
    var countService = 0;
    
    webservice.addService("testService", function(params, callback) {
      ++countService;
      callback(testValue);
    }, {useCache: true});
    
    webservice.testService.bind("before", function(event) {
    	++countListener;
    });
      
    var repeat = 4;
    callWebService("testService", {}, repeat, function() {
      test.assertEq(repeat, countListener);
      test.assertEq(1, countService);
      test.done();
    }, undefined, test, testValue);
  };
  
  self.multipleListeners = function (test) {
    var value = "";
    var testValue = "ElaiJS";
    
    webservice.addService("testService", function(params, callback) {
      value += "d";
      callback(testValue);
    });
    
    webservice.testService.bind("before", function(event) {
      value += "a";
    });
    
    webservice.testService.bind("before", function(event) {
      value += "b";
    });
    
    webservice.testService.bind("before", function(event) {
      value += "c";
    });
    
    webservice.testService.bind("after", function(event) {
      value += "e";
    });
    
    webservice.testService.bind("after", function(event) {
      value += "f";
    });
    
    webservice.testService.bind("after", function(event) {
      value += "g";
    });
      
    var repeat = 1;
    callWebService("testService", {}, repeat, function() {
      test.assertEq("abcdefg", value);
      test.done();
    }, undefined, test, testValue);
  };
  
  self.afterListener = function (test) {
    var value = "";
    var testValue = "ElaiJS";
    var testValue2 = "ElaiJSParams";
    var testValue3 = "ElaiJsServiceParams";
    
    webservice.addService("testService", function(params, callback) {
      value += "b";
      callback(testValue);
    });
    
    webservice.testService.bind("after", function(event) {
    	test.assertEq(event.data.params.testValue2, testValue2);
      test.assertEq(event.data.serviceParams.test, testValue3);
      value += "a";
    });
      
    var repeat = 1;
    callWebService("testService", {testValue2: testValue2}, repeat, function() {
      test.assertEq("ba", value);
      test.done();
    }, {test: testValue3}, test, testValue);
  };
  
  self.afterListenerCache = function (test) {
    var value = "";
    var testValue = "ElaiJS";
    
    webservice.addService("testService", function(params, callback) {
      value += "b";
      callback(testValue);
    }, {useCache: true});
    
    webservice.testService.bind("after", function(event) {
      value += "a";
    });
      
    var repeat = 4;
    callWebService("testService", {}, repeat, function() {
      test.assertEq("baaaa", value);
      test.done();
    }, undefined, test, testValue);
  };
  
  self.afterListenerResult = function (test) {
    var value = "";
    var testValue = "ElaiJS";
    var count = 0;
    
    webservice.addService("testService", function(params, callback) {
      value += "b";
      callback(testValue);
    });
    
    webservice.testService.bind("after", function(event) {
      value += "a";
      test.assertEq(testValue, event.data.result);
    });
      
    var repeat = 1;
    callWebService("testService", {}, repeat, function() {
      test.assertEq("ba", value);
      test.done();
    });
  };
  
  self.removeListener = function (test) {
    var value = "";
    var testValue = "ElaiJS";
    var count = 0;
    
    webservice.addService("testService", function(params, callback) {
      value += "b";
      callback(testValue);
    });
    
    webservice.testService.bind("after", function(event) {
      value += "c";
    });
    
    var beforeListenerCallback = function(event) {
      value += "a";
    };
    webservice.testService.bind("before", beforeListenerCallback);
      
    var repeat = 1;
    callWebService("testService", {}, repeat, function() {
      test.assertEq("abc", value);
      webservice.testService.unbind("before");
      webservice.testService.unbind("after");
      
      repeat = 4;
      callWebService("testService", {}, repeat, function() {
        test.assertEq("abcbbbb", value);
        test.done();
      });
    });
  };
  
  self.beforeInterceptor = function (test) {
    var value = "";
    var testValue = "ElaiJS";
    
    webservice.addService("testService", function(params, callback) {
      value += "b";
      callback(testValue);
    });
    
    webservice.testService.interceptors.before.add(function(context) {
      value += "a";
      
      return context;
    });
      
    var repeat = 4;
    callWebService("testService", {}, repeat, function() {
      test.assertEq("aaaabbbb", value);
      
      callWebService("testService", {}, 1, function() {
	      test.assertEq("aaaabbbbab", value);
	      test.done();
	    });
    });
  };
  
  self.beforeInterceptorParams = function (test) {
    var testValue = "ElaiJS";
    var testValue2 = "ElaiJS2";
    
    webservice.addService("testService", function(params, callback) {
      callback(params.test);
    });
    
    webservice.testService.interceptors.before.add(function(context) {
      context.params.test = testValue2;
      return context;
    });
      
    webservice.testService({test: testValue}).then(function(result) {
      test.assertEq(testValue2, result);
      test.done();
    });
  };
  
  self.afterInterceptor = function (test) {
    webservice.testService.unbind("before");
    webservice.testService.unbind("after");
    
    var value = "";
    var testValue = "ElaiJS";
    
    webservice.addService("testService", function(params, callback) {
      value += "b";
      callback(testValue);
    });
    
    webservice.testService.interceptors.after.add(function(context) {
      value += "a";
      return context;
    });
      
    var repeat = 4;
    callWebService("testService", {}, repeat, function() {
      test.assertEq("bbbbaaaa", value);
      
      callWebService("testService", {}, 1, function() {
	      test.assertEq("bbbbaaaaba", value);
	      test.done();
	    });
    });
  };
  
  self.afterInterceptorResult = function (test) {
    var testValue = "ElaiJS";
    var testValue2 = "ElaiJS2";
    
    webservice.addService("testService", function(params, callback) {
      callback(testValue);
    });
    
    webservice.testService.interceptors.after.add(function(context) {
    	context.result = testValue2;
    	return context;
    });
      
    webservice.testService(undefined).then(function(result) {
      test.assertEq(testValue2, result);
      test.done();
    });
  };
  
  self.removeInterceptor = function (test) {
    var value = "";
    var testValue = "ElaiJS";
    var count = 0;
    
    webservice.addService("testService", function(params, callback) {
      value += "b";
      callback(testValue);
    });
    
    var afterInt = webservice.testService.interceptors.after.add(function(context) {
      value += "c";
      return context;
    });
    
    var beforeInterceptorCB = function(context) {
      value += "a";
      return context;
    };
    var beforeInt = webservice.testService.interceptors.before.add(beforeInterceptorCB);
      
    var repeat = 4;
    callWebService("testService", {}, repeat, function() {
      test.assertEq("aaaabbbbcccc", value);
      webservice.testService.interceptors.before.remove(beforeInt);
      webservice.testService.interceptors.after.remove();
      
      callWebService("testService", {}, repeat, function() {
        test.assertEq("aaaabbbbccccbbbb", value);
        test.done();
      });
    });
  };
  
  self.beforeInterceptorServiceParams = function (test) {
    var count = 0;
    var testValue = "ElaiJS";
    
    webservice.addService("testService", function(params, callback) {
      ++count;
      callback(testValue);
    });
    
    webservice.testService.interceptors.before.add(function(context) {
      context.serviceParams.useCache = true;
      return context;
    });
    
    var repeat = 4;
    callWebService("testService", {}, repeat, function() {
      test.assertEq(1, count);
      
      webservice.testService.interceptors.before.remove();
      test.done();
    });
  };
  
  self.beforeInterceptorError = function (test) {
    var testValue = "ElaiJS";
    
    webservice.addService("testService", function(params, callback) {
      callback(testValue);
    });
    
    webservice.testService.interceptors.before.add(function(context) {
      throw Error();
    });
    
    webservice.testService.interceptors.before.add(undefined, function(context) {
    	test.done();
    	return context;
    });
    
    webservice.testService();
  };
  
  self.beforeInterceptorErrorNotCaugth = function (test) {
    var testValue = "ElaiJS";
    
    webservice.addService("testService", function(params, callback) {
      callback(testValue);
    });
    
    webservice.testService.interceptors.before.add(function(context) {
      throw Error();
    });
    
    webservice.testService.interceptors.before.add(undefined, function() {
    	throw Error();
    });
    
    webservice.testService().catch(test.done);
  };
  
  self.afterInterceptorError = function (test) {
    var testValue = "ElaiJS";
    
    webservice.addService("testService", function(params, callback) {
      callback(testValue);
    });
    
    webservice.testService.interceptors.after.add(function(context) {
      throw Error();
    });
    
    webservice.testService().catch(test.done.bind(test));
  };
  
  self.afterInterceptorErrorCaught = function (test) {
    var testValue = "ElaiJS";
    
    webservice.addService("testService", function(params, callback) {
      callback(testValue);
    });
    
    webservice.testService.interceptors.after.add(function(context) {
      throw Error();
    });
    
    webservice.testService.interceptors.after.add(test.fail, function(context) {
      return context;
    });
    
    webservice.testService().then(test.done);
  };
  
  self.afterInterceptorServiceError = function (test) {
    var testValue = "ElaiJS";
    
    webservice.addService("testService", function(params, callback) {
      throw testValue;
    });
    
    webservice.testService.interceptors.after.add(test.fail);
    
    webservice.testService.interceptors.after.add(test.fail, function(context) {
    	test.assertDefined(context.service);
    	test.assertDefined(context.params);
    	test.assertDefined(context.serviceParams);
    	test.assertEq(testValue, context.error);
      return context;
    });
    
    webservice.testService().then(test.done);
  };
  
  self.afterInterceptorServiceErrorUncaught = function (test) {
    var testValue = "ElaiJS";
    
    webservice.addService("testService", function(params, callback) {
      throw testValue;
    });
    
    webservice.testService().catch(function(error) {
    	test.assertEq(testValue, error);
      test.done();
    });
  };
  
  self.afterInterceptorServiceErrorReject = function (test) {
    var testValue = "ElaiJS";
    
    webservice.addService("testService", function(params, callback, reject) {
      reject(testValue);
    });
    
    webservice.testService.interceptors.after.add(test.fail);
    
    webservice.testService.interceptors.after.add(test.fail, function(context) {
    	test.assertDefined(context.service);
    	test.assertDefined(context.params);
    	test.assertDefined(context.serviceParams);
    	test.assertEq(testValue, context.error);
      return context;
    });
    
    webservice.testService().then(test.done);
  };
  
  self.afterInterceptorServiceErrorRejectUncaught = function (test) {
    var testValue = "ElaiJS";
    
    webservice.addService("testService", function(params, callback, reject) {
      reject(testValue);
    });
    
    webservice.testService.interceptors.after.add(test.fail);
    
    webservice.testService().catch(function(error) {
    	test.assertEq(testValue, error);
      test.done();
    });
  };
  
  self.serviceErrorRejectUncaught = function (test) {
    var testValue = "ElaiJS";
    
    webservice.addService("testService", function(params, callback, reject) {
      reject(testValue);
    });
    
    webservice.testService().catch(function(error) {
    	test.assertEq(testValue, error);
      test.done();
    });
  };
    
  self.serviceErrorUncaught = function (test) {
    var testValue = "ElaiJS";
    
    webservice.addService("testService", function(params, callback) {
      throw testValue;
    });
    
    webservice.testService.interceptors.after.add(test.fail);
    
    webservice.testService().catch(function(error) {
    	test.assertEq(testValue, error);
      test.done();
    });
  };
  
  self.currentStack = function (test) {
    var count = 0;
    
    webservice.addService("testCurrentService", function(params, callback) {
      ++count;
      setTimeout(function() {
        callback();
      }, 500);
    }, {useCache: true});
    
    var repeat = 4;
    callWebService("testCurrentService", {}, repeat, function() {
      test.assertEq(1, count);
      
      test.done();
    });
  };
  
  self.checkErrorHandler = function (test) {
    webservice.addService("testErrorService", function(params, callback) {
      throw new Error();
    });
    
    webservice.testErrorService({}).then(test.fail, test.done);
  };
  
  self.checkErrorHandler2 = function (test) {
    webservice.addService("testErrorService", function(params, callback, errCallback) {
      errCallback();
    });
    
    webservice.testErrorService({}).then(test.fail, test.done);
  };
  
  self.checkErrorHandlerWithInterceptor = function (test) {
    webservice.addService("testErrorService", function(params, callback, errCallback) {
      callback();
    });
    
    webservice.testErrorService.interceptors.before.add(function(params, serviceParams, callback, errCallback) {
      throw new Error();
    });
    
    webservice.testErrorService({}).then(test.fail, test.done);
  };
  
  self.checkErrorHandlerWithInterceptor2 = function (test) {
    webservice.addService("testErrorService", function(params, callback, errCallback) {
      callback();
    });
    
    webservice.testErrorService.interceptors.before.add(function(params, serviceParams, callback, errCallback) {
      errCallback();
    });
    
    webservice.testErrorService({}).then(test.fail, test.done);
  };
  
	return self;
});