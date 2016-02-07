define(["elaiJS/cascadeCaller"],
            function(cascadeCaller) {
	'use strict';
  var self = {};
  
  self.simple = function (test) {
    var value = "";
    var testA = function (callback) {
      value += "a";
      callback();
    };
    
    var testB = function (callback) {
      value += "b";
      callback();
    };
    
    var testC = function (callback) {
      value += "c";
      callback();
    };
    
    cascadeCaller([testA, testB, testB, testC, testA, testB], undefined, function() {
      test.assertEq("abbcab", value);
      test.done();
    });
  };
  
  self.withParam = function (test) {
    var testA = function (params1, callback) {
      callback(params1 + "a");
    };
    
    var testB = function (params1, callback) {
      callback(params1 + "b");
    };
    
    var testC = function (params1, callback) {
      callback(params1 + "c");
    };
    
    cascadeCaller([testA, testB, testB, testC, testA, testB], [""], function(params1) {
      test.assertEq("abbcab", params1);
      test.done();
    });
  };
  
  self.withParams = function (test) {
    var testA = function (params1, params2, callback) {
      callback(params1 + "a", params2+1);
    };
    
    var testB = function (params1, params2, callback) {
      callback(params1 + "b", params2+2);
    };
    
    var testC = function (params1, params2, callback) {
      callback(params1 + "c", params2+3);
    };
    
    cascadeCaller([testA, testB, testB, testC, testA, testB], ["", 0],
      function(params1, params2) {
        test.assertEq("abbcab", params1);
        test.assertEq((1 + 2 + 2 + 3 + 1 + 2), params2);
        test.done();
      }
    );
  };
  
  self.withScope = function (test) {
    var testValue = "ElaiJS";
    var testA = function (params1, callback) {
      test.assertEq(testValue, this.value);
      callback(params1 + "a");
    };
    
    cascadeCaller([testA, testA], [""], function(params1) {
      test.assertEq(params1, "aa");
      test.done();
    }, undefined, {value: testValue});
  };
  
  self.withError = function (test) {
    var testA = function () {
      throw new Error();
    };
    
    cascadeCaller([testA, testA], [""], test.fail, test.done);
  };
  
  self.withErrors = function (test) {
    var testA = function (param1, callback) {
      callback();
    };
    
    var testB = function () {
      throw new Error();
    };
    
    cascadeCaller([testA, testB, testA], [""], test.fail, test.done);
  };
  
	return self;
});