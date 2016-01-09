define(["elaiJS/binder","elaiJS/multicallback"],
            function(binder, multicallback) {
	'use strict';
  var self = {};
  
  self.simpleBind = function () {
    var obj = {};
    binder.bind.call(obj, "ev", this.done);
    binder.fire.call(obj, "ev");
  };
  
  self.bindParams = function (test) {
    var obj = {};
    var testValue = "ElaiJS";
    
    binder.bind.call(obj, "ev2", function(event, params) {
      test.assertEq(testValue, params.testValue);
      test.done();
    }, {testValue: testValue});
    
    binder.fire.call(obj, "ev2");
  };
  
  self.bindData = function (test) {
    var obj = {};
    var testValue = "ElaiJS";
    
    binder.bind.call(obj, "ev3", function(event) {
      test.assertEq(testValue, event.data.testValue);
      test.done();
    });
    
    binder.fire.call(obj, "ev3", {testValue: testValue});
  };
  
  self.bindScope = function (test) {
    var obj = {};
    var testValue = "ElaiJS";
    
    binder.bind.call(obj, "ev4", function() {
      test.assertEq(testValue, this.testValue);
      test.done();
    }, undefined, {testValue: testValue});
    
    binder.fire.call(obj, "ev4");
  };
  
  self.simpleUnbind = function (test) {
    var obj = {};
    
    var eventCallback = function() {
      test.error("unbind error");
    };
    binder.bind.call(obj, "ev5", eventCallback);
    
    binder.unbind.call(obj, "ev5", eventCallback);
    binder.fire.call(obj, "ev5");
    
    setTimeout(this.done, 100);
  };
  
  self.unbindAll = function (test) {
    var obj = {};
    
    var eventCallback = function() {test.error("unbind error");};
    var eventCallback2 = function() {test.error("unbind error");};
    binder.bind.call(obj, "ev6", eventCallback);
    binder.bind.call(obj, "ev6", eventCallback2);
    
    binder.unbind.call(obj, "ev6");
    binder.fire.call(obj, "ev6");
    
    setTimeout(test.done, 100);
  };
  
  self.bindGlobal = function () {
    binder.bindGlobal("evGlobal1", this.done);
    binder.fireGlobal("evGlobal1");
  };
  
  self.simpleBindOne = function () {
    var obj = {};
    binder.bindOne.call(obj, "ev7", this.done);
    binder.fire.call(obj, "ev7");
  };
  
  self.simpleBindOne2 = function (test) {
    var obj = {};
    
    var count = 0;
    binder.bindOne.call(obj, "ev8", function(){++count;});
    binder.fire.call(obj, "ev8");
    binder.fire.call(obj, "ev8");
    
    setTimeout(function() {
      test.assertEq(1, count);
      test.done();
    }, 100);
  };
  
	return self;
});