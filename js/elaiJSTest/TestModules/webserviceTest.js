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
    
    webservice["testService"](undefined, function(result) {
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
    
    webservice["testService"]({testValue3: testValue3}, function(result) {
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
    
    var repeat = 1;
    callWebService("testService", {}, repeat, function() {
      test.assertEq(1, count);
      test.done();
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
      webservice[name](params, checkResult, undefined, serviceParams);
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
      
      webservice.setDefaultServiceParams("testService", {useCache: true});
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
      
      webservice.setDefaultServiceParams("testService", {searchInCache: false});
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
      
      webservice.setDefaultServiceParams("testService", {searchInCache: true});
      callWebService("testService", {}, repeat, function() {
        test.assertEq(repeat, count);
        
        callWebService("testService", {}, repeat, function() {
          test.assertEq(repeat * 2, count);
          
          test.done();
        }, {searchInCache: false});
      });
    });
  };
  
  self.setServiceParamsScope = function (test) {
    var testScope = {sun: 42};
    var testScope2 = {happy: "hope"};
    
    webservice.addService("testService", function(params, callback) {
      callback();
    }, {scope: testScope});
    
    webservice.testService(undefined, function() {
      test.assertEq(42, this.sun);
      test.assertUndefined(this.happy);
      
      webservice.testService(undefined, function() {
        test.assertEq("hope", this.happy);
        test.done();
      }, undefined, {scope: testScope2});
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
      webservice.addBeforeListener("testServiceUnknow", function() {});
      test.error("Add an unknow service need to be prevent.");
    } catch(e) {
      test.done();
    }
  };
  
  self.beforeListener = function (test) {
    var value = "";
    var testValue = "ElaiJS";
    var count = 0;
    
    webservice.addService("testService", function(params, callback) {
      value += "b";
      callback(testValue);
    });
    
    webservice.addBeforeListener("testService", function(params) {
      value += "a";
    });
      
    var repeat = 4;
    callWebService("testService", {}, repeat, function() {
      test.assertEq("abababab", value);
      test.done();
    }, undefined, test, testValue);
  };
  
  self.beforeListenerParams = function (test) {
    var value = "";
    var testValue = "ElaiJS";
    var testValue2 = "ElaiJSParams";
    var testValue3 = "ElaiJsServiceParams";
    var count = 0;
    
    webservice.addService("testService", function(params, callback) {
      value += "b";
      callback(testValue);
    });
    
    webservice.addBeforeListener("testService", function(event) {
      test.assertEq(event.data.params.testValue2, testValue2);
      test.assertEq(event.data.serviceParams.test, testValue3);
      value += "a";
    });
      
    var repeat = 4;
    callWebService("testService", {testValue2: testValue2}, repeat, function() {
      test.assertEq("abababab", value);
      test.done();
    }, {test: testValue3}, test, testValue);
  };
  
  self.beforeListenerCache = function (test) {
    var value = "";
    var testValue = "ElaiJS";
    var count = 0;
    
    webservice.addService("testService", function(params, callback) {
      value += "b";
      callback(testValue);
    }, {useCache: true});
    
    webservice.addBeforeListener("testService", function(params) {
      value += "a";
    });
      
    var repeat = 4;
    callWebService("testService", {}, repeat, function() {
      test.assertEq("abaaa", value);
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
    
    webservice.addBeforeListener("testService", function(params) {
      value += "a";
    });
    
    webservice.addBeforeListener("testService", function(params) {
      value += "b";
    });
    
    webservice.addBeforeListener("testService", function(params) {
      value += "c";
    });
    
    webservice.addAfterListener("testService", function(params) {
      value += "e";
    });
    
    webservice.addAfterListener("testService", function(params) {
      value += "f";
    });
    
    webservice.addAfterListener("testService", function(params) {
      value += "g";
    });
      
    var repeat = 4;
    callWebService("testService", {}, repeat, function() {
      test.assertEq("abcdefgabcdefgabcdefgabcdefg", value);
      test.done();
    }, undefined, test, testValue);
  };
  
  self.afterListener = function (test) {
    var value = "";
    var testValue = "ElaiJS";
    var count = 0;
    
    webservice.addService("testService", function(params, callback) {
      value += "b";
      callback(testValue);
    });
    
    webservice.addAfterListener("testService", function(params) {
      value += "a";
    });
      
    var repeat = 4;
    callWebService("testService", {}, repeat, function() {
      test.assertEq("babababa", value);
      test.done();
    }, undefined, test, testValue);
  };
  
  self.afterListenerCache = function (test) {
    var value = "";
    var testValue = "ElaiJS";
    var count = 0;
    
    webservice.addService("testService", function(params, callback) {
      value += "b";
      callback(testValue);
    }, {useCache: true});
    
    webservice.addAfterListener("testService", function(params) {
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
    
    webservice.addAfterListener("testService", function(event) {
      value += "a";
      test.assertEq(testValue, event.data.result[0]);
    });
      
    var repeat = 4;
    callWebService("testService", {}, repeat, function() {
      test.assertEq("babababa", value);
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
    
    webservice.addAfterListener("testService", function(event) {
      value += "c";
    });
    
    var beforeListenerCallback = function(event) {
      value += "a";
    };
    webservice.addBeforeListener("testService", beforeListenerCallback);
      
    var repeat = 4;
    callWebService("testService", {}, repeat, function() {
      test.assertEq("abcabcabcabc", value);
      webservice.removeBeforeListener("testService", beforeListenerCallback);
      webservice.removeAfterListener("testService");
      
      callWebService("testService", {}, repeat, function() {
        test.assertEq("abcabcabcabcbbbb", value);
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
    
    webservice.addBeforeInterceptor("testService", function(params, serviceParams, callback) {
      value += "a";
      
      callback(params, serviceParams);
    });
      
    var repeat = 4;
    callWebService("testService", {}, repeat, function() {
      test.assertEq("abababab", value);
      test.done();
    });
  };
  
  self.beforeInterceptorParams = function (test) {
    var testValue = "ElaiJS";
    var testValue2 = "ElaiJS2";
    
    webservice.addService("testService", function(params, callback) {
      callback(params.test);
    });
    
    webservice.addBeforeInterceptor("testService", function(params, serviceParams, callback) {
      if(params)
        params.test = testValue2;
      callback(params, serviceParams);
    });
      
    webservice["testService"]({test: testValue}, function(result) {
      test.assertEq(testValue2, result);
      test.done();
    });
  };
  
  self.afterInterceptor = function (test) {
    webservice.removeBeforeListener("testService");
    webservice.removeAfterListener("testService");
    
    var value = "";
    var testValue = "ElaiJS";
    
    webservice.addService("testService", function(params, callback) {
      value += "b";
      callback(testValue);
    });
    
    webservice.addAfterInterceptor("testService", function(params, serviceParams, result, callback) {
      value += "a";
      callback(params, serviceParams, result);
    });
      
    var repeat = 4;
    callWebService("testService", {}, repeat, function() {
      test.assertEq("babababa", value);
      test.done();
    });
  };
  
  self.afterInterceptorResult = function (test) {
    var testValue = "ElaiJS";
    var testValue2 = "ElaiJS2";
    
    webservice.addService("testService", function(params, callback) {
      callback(testValue);
    });
    
    webservice.addAfterInterceptor("testService", function(params, serviceParams, result, callback) {
      callback(params, serviceParams, [testValue2]);
    });
      
    webservice["testService"](undefined, function(result) {
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
    
    webservice.addAfterInterceptor("testService", function(params, serviceParams, result, callback) {
      value += "c";
      callback(params, serviceParams, result);
    });
    
    var beforeInterceptorCallback = function(params, serviceParams, callback) {
      value += "a";
      callback(params, serviceParams);
    };
    webservice.addBeforeInterceptor("testService", beforeInterceptorCallback);
      
    var repeat = 4;
    callWebService("testService", {}, repeat, function() {
      test.assertEq("abcabcabcabc", value);
      webservice.removeBeforeInterceptor("testService", beforeInterceptorCallback);
      webservice.removeAfterInterceptor("testService");
      
      callWebService("testService", {}, repeat, function() {
        test.assertEq("abcabcabcabcbbbb", value);
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
    
    webservice.addBeforeInterceptor("testService", function(params, serviceParams, callback) {
      serviceParams.useCache = true;
      callback(params, serviceParams);
    });
    
    var repeat = 4;
    callWebService("testService", {}, repeat, function() {
      test.assertEq(1, count);
      
      webservice.removeBeforeInterceptor("testService");
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
    
    webservice.testErrorService({}, test.fail, test.done);
  };
  
  self.checkErrorHandler2 = function (test) {
    webservice.addService("testErrorService", function(params, callback, errCallback) {
      errCallback();
    });
    
    webservice.testErrorService({}, test.fail, test.done);
  };
  
  self.checkErrorHandlerWithInterceptor = function (test) {
    webservice.addService("testErrorService", function(params, callback, errCallback) {
      callback();
    });
    
    webservice.addBeforeInterceptor("testErrorService", function(params, serviceParams, callback, errCallback) {
      throw new Error();
    });
    
    webservice.testErrorService({}, test.fail, test.done);
  };
  
  self.checkErrorHandlerWithInterceptor2 = function (test) {
    webservice.addService("testErrorService", function(params, callback, errCallback) {
      callback();
    });
    
    webservice.addBeforeInterceptor("testErrorService", function(params, serviceParams, callback, errCallback) {
      errCallback();
    });
    
    webservice.testErrorService({}, test.fail, test.done);
  };
  
	return self;
});