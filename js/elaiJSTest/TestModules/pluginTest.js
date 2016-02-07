define(["elaiJS/configuration", "elaiJS/widget", "elaiJS/helper", "elaiJS/plugin"],
          function(config, widgetManager, helper, pluginManager) {
	'use strict';
  var self = {};

  self.beforeTest = function(callback) {
    config.defaultPlugins = undefined;
    config.ressources.widgets = "elaiJSTest/TestModules/TestWidgets";
    config.ressources.plugins = "elaiJSTest/TestModules/TestWidgets";
    callback();
  };
  
  self.defaultPlugin = function(test) {
    config.defaultPlugins = {"plugin1": {}};
    
    widgetManager.create("widget1", "w1", undefined, function(widget) {
      test.assertEq("love", widget.cute);
      test.assertEq(42, widget.kindness);
      test.assertEq(true, widget.hasPlugin1);
      
      test.done();
    });
  };
  
  self.noDefault = function(test) {
    config.defaultPlugins = undefined;
    
    widgetManager.create("widget1", "noPlugin", undefined, function(widget) {
      test.assertUndefined(widget.hasPlugin1);
      test.assertUndefined(widget.cute);
      test.assertUndefined(widget.kindness);
      
      test.done();
    });
  };
  
  self.applyPlugin = function(test) {
    config.defaultPlugins = undefined;
    
    widgetManager.create("widget1", "applyPlugin", undefined, function(widget) {
      test.assertUndefined(widget.hasPlugin1);
      test.assertUndefined(widget.cute);
      test.assertUndefined(widget.kindness);
      
      pluginManager.applyPlugin({name: "plugin1"}, widget, function() {
        test.assertEq(true, widget.hasPlugin1);

        widget.initialize({}, function() {
          test.assertEq("love", widget.cute);
          test.assertEq(42, widget.kindness);
        
          test.done();
        });
      });
    });
  };
  
  self.applyPlugins = function(test) {
    config.defaultPlugins = undefined;
    
    widgetManager.create("widget1", "applyPlugins", undefined, function(widget) {
      test.assertUndefined(widget.hasPlugin1);
      test.assertUndefined(widget.hasPlugin2);
      
      var plugins = {
        plugin1: {name: "plugin1"},
        plugin2: {name: "plugin2"}
      };
      
      pluginManager.applyPlugins(plugins, widget, function() {
        test.assertEq(true, widget.hasPlugin1);
        test.assertEq(true, widget.hasPlugin2);

        widget.initialize({}, function() {
          test.assertEq(2, widget.here.length);
          test.assertEq("plugin1", widget.here[0]);
          test.assertEq("plugin2", widget.here[1]);
        
          test.done();
        });
      });
    });
  };
  
  self.applyPluginPriority = function(test) {
    config.defaultPlugins = undefined;
    
    widgetManager.create("widget1", "priority", undefined, function(widget) {
      test.assertUndefined(widget.hasPlugin1);
      test.assertUndefined(widget.hasPlugin2);
      
      var plugins = {
        plugin1: {name: "plugin1"},
        plugin2: {name: "plugin2", priority: 99}
      };
      
      pluginManager.applyPlugins(plugins, widget, function() {
        test.assertEq(true, widget.hasPlugin1);
        test.assertEq(true, widget.hasPlugin2);

        widget.initialize({}, function() {
          test.assertEq(2, widget.here.length);
          test.assertEq("plugin2", widget.here[0]);
          test.assertEq("plugin1", widget.here[1]);
        
          test.done();
        });
      });
    });
  };
  
  self.propertyPlugin = function(test) {
    config.defaultPlugins = undefined;
    
    widgetManager.create("widgetPlugin1", "property", undefined, function(widget) {
      test.assertEq(true, widget.hasPlugin1);
      test.assertUndefined(widget.hasPlugin2);
      test.assertEq(1, widget.here.length);
      test.assertEq("plugin1", widget.here[0]);
      test.assertEq("hug", widget.sunPlugin);
      
      test.done();
    });
  };
  
  self.propertyPluginDefault = function(test) {
    config.defaultPlugins = {plugin2: {}};
    
    widgetManager.create("widgetPlugin1", "propertyDefault", undefined, function(widget) {
      test.assertEq(true, widget.hasPlugin1);
      test.assertUndefined(widget.hasPlugin2);
      test.assertEq(1, widget.here.length);
      test.assertEq("plugin1", widget.here[0]);
      test.assertEq("hug", widget.sunPlugin);
      
      test.done();
    });
  };
  
  self.propertyPluginParent = function(test) {
    config.defaultPlugins = undefined;
    
    widgetManager.create("widgetPlugin2", "propertyParent", undefined, function(widget) {
      test.assertEq(true, widget.hasPlugin1);
      test.assertEq(true, widget.hasPlugin2);
      test.assertEq(2, widget.here.length);
      test.assertEq("plugin2", widget.here[0]);
      test.assertEq("plugin1", widget.here[1]);
      test.assertEq("bighug", widget.sunPlugin);
      
      test.done();
    });
  };
  
	return self;
});