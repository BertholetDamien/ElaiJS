define(["elaiJS/configuration"],
          function(config) {
	'use strict';
  var self = {};
  
  self.directSetValue = function () {
    config.test = 42;
    
    this.assertEq(42, config.test);
    this.done();
  };
  
  self.indirectSetValue = function () {
    config({test2: 42});
    
    this.assertEq(42, config.test2);
    this.done();
  };
  
  self.complexeIndirectSetValue = function () {
    config.test = {field1: 42, field2: 101110};
    this.assertEq(42, config.test.field1);
    this.assertEq(101110, config.test.field2);
    
    config({test: {field2: 42}});
    
    this.assertEq(42, config.test.field1);
    this.assertEq(42, config.test.field2);
    
    this.done();
  };
  
  self.deleteValue = function () {
    config.test = 42;
    this.assertEq(42, config.test);
    delete config.test;
    
    this.assertUndefined(config.test);
    
    this.done();
  };
  
  self.complexeDeleteValue = function () {
    config.test = {field1: 42, field2: 101110};
    this.assertEq(42, config.test.field1);
    this.assertEq(101110, config.test.field2);
    
    delete config.test.field1;
    
    this.assertUndefined(config.test.field1);
    this.assertEq(101110, config.test.field2);
    this.assertEq(1, Object.keys(config.test).length);
    
    delete config.test.field2;
    this.assertDefined(config.test);
    this.assertEq(0, Object.keys(config.test).length);
    
    this.done();
  };
  
  self.insertDefault1 = function () {
    config.test = {field1: 42, field2: 101110};
    this.assertEq(42, config.test.field1);
    this.assertEq(101110, config.test.field2);

    delete config.test2;
    config({test2: "test2"}, true);
    
    this.assertDefined(config.test2);
    this.assertEq("test2", config.test2);
    
    this.done();
  };
  
  self.insertDefault2 = function () {
    config.test = {field1: 42, field2: 101110};
    this.assertEq(42, config.test.field1);
    this.assertEq(101110, config.test.field2);
    
    config({test: "test"}, true);
    
    this.assertDefined(config.test);
    this.assertEq(42, config.test.field1);
    this.assertEq(101110, config.test.field2);
    
    this.done();
  };
  
  self.insertDefault3 = function () {
    config.test = {field1: 42, field2: 101110};
    this.assertEq(42, config.test.field1);
    this.assertEq(101110, config.test.field2);
    
    config({test: {field1: "field1"}}, true);
    
    this.assertDefined(config.test);
    this.assertEq(42, config.test.field1);
    this.assertEq(101110, config.test.field2);
    
    config({test: {field3: "field3"}}, true);
    this.assertEq("field3", config.test.field3);
    
    this.done();
  };
  
	return self;
});