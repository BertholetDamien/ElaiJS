define([  "elaiJS/multicallback"],
          function(multicallback) {
	'use strict';
  var self = {};
  
  self.simple = function (test) {
    var multicallbackFct = multicallback(1, test.done);
    multicallbackFct();
  };
  
  self.randomCall = function (test) {
    var count = Math.random();
    var multicallbackFct = multicallback(count, test.done);
    for(var i = 0 ; i < count ; ++i)
      multicallbackFct();
  };
  
  self.count0 = function (test) {
    var multicallbackFct = multicallback(0, test.done);
    multicallbackFct();
  };
  
  self.withoutCallback = function (test) {
    var multicallbackFct = multicallback(1);
    multicallbackFct();
    test.done();
  };
  
  self.withScope = function (test) {
    var scope = {framboise: 42};
    var multicallbackFct = multicallback(3, function() {
      test.assertEq(42, this.framboise);
      test.done();
    }, scope);
    
    multicallbackFct();
    multicallbackFct();
    multicallbackFct();
  };
  
	return self;
});