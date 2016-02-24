define(["elaiJS/configuration", "elaiJS/ressources", "elaiJS/helper"],
          function(config, ressources, helper) {
	'use strict';
  var self = {};
  
  self.noRessources = function () {
    var value = ressources.get("unkown");
    
    this.assertUndefined(value);
    this.done();
  };
  
  self.simpleRessources = function () {
    var res1 = "superRes1";
    config.elaiJS.ressources = {
      res1: res1
    };
    
    var value = ressources.get("res1");
    this.assertEq(res1, value);
    this.done();
  };
  
  self.indirectRessource = function () {
    var res1 = "superRes1";
    var res1Copy = "{{res1}}";
    config.elaiJS.ressources = {
      res1: res1,
      res1Copy: res1Copy
    };
    
    var value = ressources.get("res1Copy");
    this.assertEq(res1, value);
    this.done();
  };
  
  self.indirectRessourceNotFound = function () {
    var res1 = "superRes1";
    var res2 = "{{resUndefined}}";
    config.elaiJS.ressources = {
      res1: res1,
      res2: res2
    };
    
    var value = ressources.get("res2");
    this.assertEq("[notfound]", value);
    this.done();
  };
  
  self.indirectRessourceNotFound2 = function () {
    var res1 = "superRes1";
    var res2 = "{{res1}} {{res404}} superRes2 {{res1}}";
    config.elaiJS.ressources = {
      res1: res1,
      res2: res2
    };
    
    var value = ressources.get("res2");
    this.assertEq("superRes1 [notfound] superRes2 superRes1", value);
    this.done();
  };
  
  self.indirectRessource2 = function () {
    var res1 = "superRes1";
    var res2 = "superRes2";
    var res12 = "{{res1}} {{res2}}";
    config.elaiJS.ressources = {
      res1: res1,
      res2: res2,
      res12: res12
    };
    
    var value = ressources.get("res12");
    this.assertEq(res1 + " " + res2, value);
    this.done();
  };
  
  self.complexeIndirectRessource = function () {
    var res1 = "a";
    var res2 = "bb {{res1}} bb";
    var res3 = "ccc {{res1}} {{res2}} ccc";
    var res4 = "{{res3}} {{res3}} blabla {{res2}}";
    var wishResult = "ccc a bb a bb ccc ccc a bb a bb ccc blabla bb a bb";
    config.elaiJS.ressources = {
      res1: res1,
      res2: res2,
      res3: res3,
      res4: res4
    };
    
    var value = ressources.get("res4");
    this.assertEq(wishResult, value);
    this.done();
  };
  
  self.simpleExecute = function () {
    var res1 = "superRes1";
    config.elaiJS.ressources = {
      res1: res1
    };
    
    var value = ressources.execute("{{res1}}");
    this.assertEq(res1, value);
    this.done();
  };
  
  self.complexeExecute = function () {
    var res1 = "a";
    var res2 = "bb {{res1}} bb";
    var res3 = "ccc {{res1}} {{res2}} ccc";
    var res4 = "{{res3}} {{res3}} blabla {{res2}}";
    var wishResult = "ccc a bb a bb ccc ccc a bb a bb ccc blabla bb a bb";
    config.elaiJS.ressources = {
      res1: res1,
      res2: res2,
      res3: res3
    };
    
    var value = ressources.execute(res4);
    this.assertEq(wishResult, value);
    this.done();
  };
  
  self.simpleRessourcesChangeRessourcesList = function () {
    config.elaiJS.ressources = {};
    var res1 = "superRes1";
    var ressourcesList = {
      res1: res1
    };
    
    var value = ressources.get("res1", undefined, ressourcesList);
    this.assertEq(res1, value);
    this.done();
  };
  
  self.indirectRessourceChangeRessourcesList = function () {
    var res1 = "superRes1";
    var res1Copy = "{{res1}}";
    var ressourcesList = {
      res1: res1,
      res1Copy: res1Copy
    };
    
    var value = ressources.get("res1Copy", undefined, ressourcesList);
    this.assertEq(res1, value);
    this.done();
  };
  
  self.complexeIndirectRessourceChangeRessourcesList = function () {
    var res1 = "a";
    var res2 = "bb {{res1}} bb";
    var res3 = "ccc {{res1}} {{res2}} ccc";
    var res4 = "{{res3}} {{res3}} blabla {{res2}}";
    var wishResult = "ccc a bb a bb ccc ccc a bb a bb ccc blabla bb a bb";
    var ressourcesList = {
      res1: res1,
      res2: res2,
      res3: res3,
      res4: res4
    };
    
    var value = ressources.get("res4", undefined, ressourcesList);
    this.assertEq(wishResult, value);
    this.done();
  };
  
  self.simpleExecuteChangeRessourcesList = function () {
    var res1 = "superRes1";
    var ressourcesList = {
      res1: res1
    };
    
    var value = ressources.execute("{{res1}}", undefined, ressourcesList);
    this.assertEq(res1, value);
    this.done();
  };
  
  self.complexeExecuteChangeRessourcesList = function () {
    var res1 = "a";
    var res2 = "bb {{res1}} bb";
    var res3 = "ccc {{res1}} {{res2}} ccc";
    var res4 = "{{res3}} {{res3}} blabla {{res2}}";
    var wishResult = "ccc a bb a bb ccc ccc a bb a bb ccc blabla bb a bb";
    var ressourcesList = {
      res1: res1,
      res2: res2,
      res3: res3
    };
    
    var value = ressources.execute(res4, undefined, ressourcesList);
    this.assertEq(wishResult, value);
    this.done();
  };
  
  self.simpleRessourcesWithParams = function () {
    var res1 = "superRes1 {{param1}}";
    config.elaiJS.ressources = {
      res1: res1
    };
    
    var value = ressources.get("res1", {param1: "par1"});
    this.assertEq("superRes1 par1", value);
    this.done();
  };
  
  self.indirectRessourceWithParams = function () {
    var res1 = "superRes1 {{param1}}";
    var res2 = "{{res1}} {{param2}}";
    config.elaiJS.ressources = {
      res1: res1,
      res2: res2
    };
    
    var value = ressources.get("res2", {param1: "par1", param2: "par2"});
    this.assertEq("superRes1 par1 par2", value);
    this.done();
  };
  
  self.complexeIndirectRessourceWithParams = function () {
    var res1 = "a{{param1}}";
    var res2 = "bb {{res1}} {{param2}} bb";
    var res3 = "ccc {{res1}} {{res2}} ccc{{param3}}";
    var res4 = "{{res3}} {{res3}} {{param3}}-blabla {{res2}}";
    var wishResult = "ccc a1 bb a1 2 bb ccc3 ccc a1 bb a1 2 bb ccc3 3-blabla bb a1 2 bb";
    config.elaiJS.ressources = {
      res1: res1,
      res2: res2,
      res3: res3,
      res4: res4
    };
    
    var value = ressources.get("res4", {param1: "1", param2: "2", param3: "3"});
    this.assertEq(wishResult, value);
    this.done();
  };
  
	return self;
});