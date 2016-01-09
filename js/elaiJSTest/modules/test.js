define(["elaiJSTest/modules/testError"], function(testError) {
  var self = function(feature, callback) {
    feature.callback = callback;
    
    setTimeout(function() {
      callCallback(feature, "Time Out");
    }, 2000);
    
    testError(feature, callCallback);
    
    var test = new Test(feature);
    feature.fct.call(test, test);
  };
  
  function Test(feature) {
    var test = {};
    
    test.assert = function assert(value, mess) {
      if(value === false || value === undefined || value === null)
        throw new Error(mess || "Assert error");
    };
    
    test.assertEq = function assertEq(value1, value2) {
      if(value1 !== value2)
        throw new Error("Need '" + value1 + "' but got '" + value2 + "'");
    };
    
    test.assertUndefined = function assertUndefined(value) {
      if(value !== undefined)
        throw new Error("Need '" + value + "' to be undefined");
    };
    
    test.assertNull = function assertNull(value) {
      if(value !== null)
        throw new Error("Need '" + value + "' to be null");
    };
    
    test.assertDefined = function assertDefined(value) {
      if(value === undefined || value === null)
        throw new Error("Need '" + value + "' to be defined");
    };
    
    test.assertTrue = function assertTrue(value) {
      test.assertEq(true, value);
    };
    
    test.assertFalse = function assertFalse(value) {
      test.assertEq(false, value);
    };
    
    test.error = test.failed = function error(mess) {
      throw new Error(mess);
    };
    
    test.done = function done() {
      callCallback(feature);
    };
    
    return test;
  }
  
  function callCallback(feature, errorInfo) {
    var callback = feature.callback;
    feature.callback = undefined;
    
    if(callback)
      callback(feature, errorInfo);
  }
	
	return self;
});