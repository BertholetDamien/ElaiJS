define(["elaiJS/configuration", "elaiJS/mode", "elaiJS/helper"],
          function(config, mode, helper) {
	'use strict';
  var self = {};
  var saveRessourcesConfig;
  
  self.beforeTest = function() {
    saveRessourcesConfig = helper.clone(config.ressources);
  };
  
  self.afterTest = function() {
    config.ressources = saveRessourcesConfig;
  };
  
  self.setMode = function() {
    mode.setMode(undefined);
    this.assertUndefined(mode.getMode());
    
    mode.setMode("mode1");
    this.assertEq("mode1", mode.getMode());
    
    mode.setMode("mode2");
    this.assertEq("mode2", mode.getMode());
    
    this.done();
  };
  
  self.defaultMode = function() {
    mode.setMode(null);
    
    config.defaultMode = "default";
    this.assertEq("default", mode.getMode());
    
    config.defaultMode = "default2";
    this.assertEq("default2", mode.getMode());
    
    this.done();
  };
  
  self.setModeEvent = function(test) {
    mode.setMode("mode1");
    mode.bind(mode.EVENT.modeChanged, function(ev) {
      test.assertEq("mode1", ev.data.oldMode);
      test.assertEq("mode2", ev.data.newMode);
      test.done();
    });
    mode.setMode("mode2");
  };
  
  self.noMode = function () {
    config.modesRessources = undefined;
    
    var result = mode.findMode("type1", "name1");
    this.assertUndefined(result);
    
    result = mode.findMode("type1", {name: "name1", mode: "mode"});
    this.assertUndefined(result);
    
    this.done();
  };
  
  self.noRessourceModeTypeDefine = function () {
    config.modesRessources = undefined;
    
    var result = mode.findMode("type1", "name1");
    this.assertUndefined(result);
    
    result = mode.findMode("type1", {name: "name1", mode: "mode1"});
    this.assertUndefined(result);
    
    result = mode.findMode("type1", {name: "name1", mode: "mode2"});
    this.assertUndefined(result);
    
    this.done();
  };
  
  self.noRessourceModeNameDefine = function () {
    config.modesRessources = {type1: {}};
    
    var result = mode.findMode("type1", "name1");
    this.assertUndefined(result);
    
    result = mode.findMode("type1", {name: "name1", mode: "mode1"});
    this.assertUndefined(result);
    
    result = mode.findMode("type1", {name: "name1", mode: "mode2"});
    this.assertUndefined(result);
    
    this.done();
  };
  
  self.simpleRessourceMode = function () {
    config.modesRessources = {
      type1: {
        name1: ["mode1"]
      }
    };
    var result = mode.findMode("type1", "name1");
    this.assertUndefined(result);
    
    result = mode.findMode("type1", {name: "name1", mode: "mode1"});
    this.assertEq("mode1", result);
    
    result = mode.findMode("type1", {name: "name1", mode: "mode2"});
    this.assertUndefined(result);
    
    this.done();
  };
  
  self.complexeRessourceMode = function () {
    config.modes = {
      mode2: "mode1",
      mode3: "mode2",
      mode3b: "mode3",
      mode4: "mode3"
    };
    config.modesRessources = {
      type1: {
        name1: ["mode1", "mode2", "mode4"]
      }
    };
    
    var result = mode.findMode("type1", {name: "name1", mode: "mode1"});
    this.assertEq("mode1", result);
    
    result = mode.findMode("type1", {name: "name1", mode: "mode2"});
    this.assertEq("mode2", result);
    
    result = mode.findMode("type1", {name: "name1", mode: "mode3"});
    this.assertEq("mode2", result);
    
    result = mode.findMode("type1", {name: "name1", mode: "mode3b"});
    this.assertEq("mode2", result);
    
    result = mode.findMode("type1", {name: "name1", mode: "mode4"});
    this.assertEq("mode4", result);
    
    this.done();
  };
  
  self.getRessource = function () {
    config.ressources = {
      "name1": "Test{{name}}",
      "name1Mode": "Test {{name}}-{{mode}} Test"
    };
    
    config.modes = {};
    
    config.modesRessources = {
      type1: {
        name1: ["mode1"]
      }
    };
    
    var result = mode.getRessource("type1", "name1", "name1", "name1Mode");
    this.assertEq("Testname1", result);

    result = mode.getRessource("type1", {name: "name1", mode: "mode1"}, "name1", "name1Mode");
    this.assertEq("Test name1-mode1 Test", result);

    result = mode.getRessource("type1", {name: "name1", mode: "mode2"}, "name1", "name1Mode");
    this.assertEq("Testname1", result);

    this.done();
  };
  
  self.getRessource = function () {
    config.ressources = {
      "type1": "Test{{name}}",
      "type1Mode": "Test {{name}}-{{mode}} Test"
    };
    
    config.modes = {};
    
    config.modesRessources = {
      type1: {
        name1: ["mode1"]
      }
    };
    
    var result = mode.getRessource("type1", "name1");
    this.assertEq("Testname1", result);

    result = mode.getRessource("type1", {name: "name1", mode: "mode1"});
    this.assertEq("Test name1-mode1 Test", result);

    result = mode.getRessource("type1", {name: "name1", mode: "mode2"});
    this.assertEq("Testname1", result);

    this.done();
  };
  
	return self;
});