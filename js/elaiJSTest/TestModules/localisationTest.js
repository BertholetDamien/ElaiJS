define(["elaiJS/localisation", "elaiJS/configuration"],
            function(loc, config) {
	'use strict';
  var self = {};
  
  self.findValidLocalisation = function () {
    config.matchValidLocalisation = {
      "en": "en-US",
      "fr-CA": "fr",
      "fr": "fr-FR"
    };
    this.assertEq("en-US", loc.findValidLocalisation("en-US"));
    this.assertEq("en-US", loc.findValidLocalisation("en"));
    this.assertEq("fr-FR", loc.findValidLocalisation("fr-CA"));
    this.assertEq("fr-FR", loc.findValidLocalisation("fr-FR"));
    this.assertEq("fr-FR", loc.findValidLocalisation("fr"));
    
    this.done();
  };
  
  self.setLocalisation = function () {
    loc.setLocalisation("en");
    this.assertEq("en-US", loc.getLocalisation());
    
    loc.setLocalisation("fr");
    this.assertEq("fr-FR", loc.getLocalisation());
    
    this.done();
  };
  
  self.getSimple = function () {
    loc.setLocalisation("fr");
    config.defaultLocalisation = "en-US";
    
    this.assertEq("seulementFR", loc.get("onlyFR"));
    this.assertEq("justEN", loc.get("onlyEN"));
    this.assertEq("tous", loc.get("all"));
    
    this.done();
  };
  
  self.getWithLoc = function () {
    loc.setLocalisation("fr");
    
    this.assertEq("seulementFR", loc.get("onlyFR", "fr"));
    this.assertUndefined(loc.get("onlyFR", "en"));
    
    this.assertUndefined(loc.get("onlyEN", "fr"));
    this.assertEq("justEN", loc.get("onlyEN", "en"));
    
    this.assertEq("tous", loc.get("all", "fr"));
    this.assertEq("everything", loc.get("all", "en"));
    
    this.done();
  };
  
  self.getWithDefaultChange = function() {
    config.defaultLocalisation = "fr";
    loc.setLocalisation("fr");
    this.assertEq("seulementFR", loc.get("onlyFR"));
    this.assertUndefined(loc.get("onlyEN"));
    this.assertEq("tous", loc.get("all"));
    
    loc.setLocalisation("en");
    this.assertEq("seulementFR", loc.get("onlyFR"));
    this.assertEq("justEN", loc.get("onlyEN"));
    this.assertEq("everything", loc.get("all"));
    
    this.done();
  };
  
	return self;
});