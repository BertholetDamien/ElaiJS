define(["elaiJS/configuration", "elaiJS/widget", "elaiJS/helper"],
          function(config, widgetManager, helper) {
	'use strict';
  var self = {};

  self.beforeTest = function(callback) {
    config.elaiJS.defaultPlugins = undefined;
    config.elaiJS.ressources.widgets = "elaiJSTest/TestModules/TestWidgets";
    config.elaiJS.ressources.plugins = "elaiJSTest/TestModules/TestWidgets";
    callback();
  };
  
  self.widgetNoMode = function(test) {
    config.elaiJS.modesRessources = {
    };
    
    var property = {name: "widget1", mode: "people"};
    widgetManager.create(property, "widgetNoMode", undefined, function(widget) {
      test.assertUndefined(widget.isMode);
      test.assertUndefined(widget.mode);
      test.assertUndefined(widget.hasPlugin1);
      test.assertUndefined(widget.hasPlugin1Mode);
      
      test.done();
    });
  };
  
  self.widgetAndPluginMode = function(test) {
    config.elaiJS.modesRessources = {
      widget: {
        widget1: ["people"]
      },
      plugin: {
        plugin1: ["people"]
      }
    };
    
    var property = {name: "widget1", mode: "people"};
    widgetManager.create(property, "widgetAndPluginMode", undefined, function(widget) {
      test.assertEq(42, widget.isMode());
      test.assertEq("people", widget.mode);
      test.assertEq(true, widget.hasPlugin1);
      test.assertEq(true, widget.hasPlugin1Mode);
      
      test.done();
    });
  };
  
  self.widgetMode = function(test) {
    config.elaiJS.modesRessources = {
      widget: {
        widget1: ["people"]
      }
    };
    
    var property = {name: "widget1", mode: "people"};
    widgetManager.create(property, "widgetOnlyMode", undefined, function(widget) {
      test.assertEq(42, widget.isMode());
      test.assertEq("people", widget.mode);
      test.assertEq(true, widget.hasPlugin1);
      test.assertUndefined(widget.hasPlugin1Mode);
      
      test.done();
    });
  };
  
	return self;
});