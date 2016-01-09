define(["elaiJS/language", "elaiJS/configuration"],
            function(lang, config) {
	'use strict';
  var self = {};
  
  self.setLanguage = function () {
    lang.setLanguage("en");
    this.assertEq("en", lang.getLanguage());
    lang.setLanguage("fr");
    this.assertEq("fr", lang.getLanguage());
    
    this.done();
  };
  
  self.getSimple = function () {
    lang.setLanguage("fr");
    config.defaultLanguage = "en";
    
    this.assertEq("seulementFR", lang.get("onlyFR"));
    this.assertEq("justEN", lang.get("onlyEN"));
    this.assertEq("tous", lang.get("all"));
    
    this.done();
  };
  
  self.getWithLang = function () {
    lang.setLanguage("fr");
    
    this.assertEq("seulementFR", lang.get("onlyFR", undefined, "fr"));
    this.assertUndefined(lang.get("onlyFR", undefined, "en"));
    
    this.assertUndefined(lang.get("onlyEN", undefined, "fr"));
    this.assertEq("justEN", lang.get("onlyEN", undefined, "en"));
    
    this.assertEq("tous", lang.get("all", undefined, "fr"));
    this.assertEq("everything", lang.get("all", undefined, "en"));
    
    this.done();
  };
  
  self.getWithDefaultChange = function() {
    config.defaultLanguage = "fr";
    lang.setLanguage("fr");
    this.assertEq("seulementFR", lang.get("onlyFR"));
    this.assertUndefined(lang.get("onlyEN"));
    this.assertEq("tous", lang.get("all"));
    
    lang.setLanguage("en");
    this.assertEq("seulementFR", lang.get("onlyFR"));
    this.assertEq("justEN", lang.get("onlyEN"));
    this.assertEq("everything", lang.get("all"));
    
    this.done();
  };
  
  self.getWithParams = function() {
    config.defaultLanguage = "en";
    lang.setLanguage("fr");

    var params = {kindness: "hope", love: "happy"};
    this.assertEq("hope justEN happy", lang.get("onlyENParams", params));
    this.assertEq("hope seulementFR happy", lang.get("onlyFRParams", params));
    this.assertEq("hope happy tous happyhappy", lang.get("allParams", params));
    this.assertEq("hope happy everything", lang.get("allParams", params, "en"));
    
    this.done();
  };
  
  self.getWithArray = function() {
    config.defaultLanguage = "en";
    lang.setLanguage("fr");

    var array = ["kindness", "love"];
    this.assertEq("kindness tous lovekindnesslove", lang.get("allArray", array));
    this.assertEq("kindness everything love", lang.get("allArray", array, "en"));
    
    this.done();
  };

	return self;
});