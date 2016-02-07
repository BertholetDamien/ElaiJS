define([  "elaiJSTest/modules/test", "elaiJS/binder", "elaiJS/helper",
          "elaiJS/ressources", "elaiJS/configuration"],
          function(test, binder, helper, res, config) {
	'use strict';
	
	var self = {};
	binder.addFunctions(self);
	
	self.features = [];
	
	var currentFeatureIndexTesting = -1;
  var beforeTestFct;
	var afterTestFct;
	var moduleTest;
	var cancel = false;
	var runCallback;
	
  function initialize() {
    var module = helper.extractGetParams().module;
    
    require([res.get("testModule", {name: module})], function(fcts) {
      moduleTest = fcts;
      initializeFeatures();
      window.callbackReady();
    });
  }
  
  function initializeFeatures() {
    for(var name in moduleTest) {
      var fct = moduleTest[name];
      
      if(name === "beforeTest")
        beforeTestFct = fct;
      else if(name === "afterTest")
        afterTestFct = fct;
      else
        self.features.push({name: name, fct: fct});
    }
  }
  
  self.run = function(callback) {
    runCallback = callback;
    if(beforeTestFct)
      beforeTestFct.call(moduleTest, function() {
        setTimeout(testNextFeature, 10);
      });
    else
      setTimeout(testNextFeature, 10);
  };
  
  self.cancel = function() {
    cancel = true;
  };
  
  function testNextFeature() {
    ++currentFeatureIndexTesting;
    
    if(!cancel && currentFeatureIndexTesting < self.features.length)
      testFeature(self.features[currentFeatureIndexTesting]);
    else
      runCallback();
  }
  
  function testFeature(feature) {
    self.fire("start_test_feature_" + feature.name);
    test(feature, function(feature, errorInfo) {
      self.fire("end_test_feature_" + feature.name, errorInfo);
      setTimeout(testNextFeature, 10);
    });
  }
  
  setTimeout(function() {
    initialize();
  }, 10);
  
  window.elaiJSTestIFrame = self;
  return self;
});