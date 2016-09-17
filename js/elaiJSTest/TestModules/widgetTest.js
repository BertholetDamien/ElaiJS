define(["elaiJS/configuration", "elaiJS/widget", "elaiJS/helper"],
          function(config, widgetManager, helper) {
	'use strict';
  var self = {};

  self.beforeTest = function(callback) {
    config.elaiJS.defaultPlugins = undefined;
    config.elaiJS.ressources.widgets = "elaiJSTest/TestModules/TestWidgets";
    config.elaiJS.ressources.widgetCSS = "elaiJSTest/TestModules/TestWidgets/{{name}}.css";
    callback();
  };
  
  self.createWidget = function(test) {
    widgetManager.create("widget1", "w1").then(function(widget) {
      if(widget) {
        test.assertEq("w1", widget.id);
        test.done();
        return;
      }
      
      test.failed("Widget not created.");
    });
  };
  
  self.alreadyExists = function(test) {
    widgetManager.create("widget1", "w1").then(function(widget) {
      test.fail();
    }, function () {
	    widgetManager.create("widget1", "w1-2").then(function(widget) {
	      widgetManager.create("widget2", "w2").then(function(widget) {
	        test.done();
	      });
	    });
    });
  };
  
  self.get = function(test) {
    this.assertDefined(widgetManager.get("w1"));
    this.assertEq("w1", widgetManager.get("w1").id);
    this.assertDefined(widgetManager.get("w1-2"));
    this.assertDefined(widgetManager.get("w2"));
    
    var w2s = widgetManager.getWidgetsByName("widget2");
    this.assertEq(1, w2s.length);
    var w2 = w2s[0];
    var w2Copy = widgetManager.get("w2");
    this.assertEq(w2, w2Copy);
    
    var w1s = widgetManager.getWidgetsByName("widget1");
    this.assertEq(2, w1s.length);
    
    this.done();
  };
  
  self.remove = function(test) {
    this.assertDefined(widgetManager.get("w1"));
    this.assertEq("w1", widgetManager.get("w1").id);
    
    var w1 = widgetManager.get("w1");
    widgetManager.remove(w1);
    this.assertUndefined(widgetManager.get("w1"));
    
    widgetManager.create("widget1", "w1").then(function(widget) {
      test.assertEq("w1", widget.id);
      test.assertDefined(widgetManager.get("w1"));
      test.done();
    });
  };
  
  self.removeByID = function(test) {
    this.assertDefined(widgetManager.get("w1"));
    this.assertEq("w1", widgetManager.get("w1").id);
    
    widgetManager.removeByID("w1");
    this.assertUndefined(widgetManager.get("w1"));
    
    widgetManager.create("widget1", "w1").then(function(widget) {
      test.assertEq("w1", widget.id);
      test.assertDefined(widgetManager.get("w1"));
      test.done();
    });
  };
  
	return self;
});