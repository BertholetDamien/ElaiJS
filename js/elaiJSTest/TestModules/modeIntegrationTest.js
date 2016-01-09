define(["elaiJS/configuration", "elaiJS/widget", "elaiJS/helper"],
          function(config, widgetManager, helper) {
	'use strict';
  var self = {};

  self.beforeTest = function() {
    config.defaultPlugins = undefined;
    config.ressources.widgets = "elaiJSTest/TestModules/TestWidgets";
    config.ressources.plugins = "elaiJSTest/TestModules/TestWidgets";
  };
  
  self.widgetNoMode = function(test) {
    config.modesRessources = {
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
    config.modesRessources = {
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
    config.modesRessources = {
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