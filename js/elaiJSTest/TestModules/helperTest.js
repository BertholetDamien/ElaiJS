define([  "elaiJS/helper"],
          function(helper) {
	'use strict';
  var self = {};
  
  self.extractGetParams = function (test) {
    var params = helper.extractGetParams();

    this.assertEq("helper", params.module);
    this.done();
  };
  
  self.extractParamsEmpty = function () {
    var params = helper.extractParams("");
    this.assertEq(0, Object.keys(params).length);
    this.done();
  };
  
  self.extractParamsValueEmpty = function () {
    var params = helper.extractParams("test");
    this.assertEq(1, Object.keys(params).length);
    this.assertUndefined(params.test);
    this.done();
  };
  
  self.extractParams = function () {
    var params = helper.extractParams("earth=life&love=inconditional");
    this.assertEq("life", params.earth);
    this.assertEq("inconditional", params.love);
    this.assertEq(2, Object.keys(params).length);
    this.assertUndefined(params.test);
    this.done();
  };
  
  self.extractParamsTrim = function () {
    var paramsStr = " earth =  life    & love= inconditional  ";
    var params = helper.extractParams(paramsStr, true);
    this.assertEq("life", params.earth);
    this.assertEq("inconditional", params.love);
    this.assertEq(2, Object.keys(params).length);
    this.assertUndefined(params.test);
    this.done();
  };
  
  self.extractArrayEmpty = function () {
    var array = helper.extractArray();
    this.assertEq(0, array.length);
    this.done();
  };
  
  self.extractArrayStringEmpty = function () {
    var array = helper.extractArray("");
    this.assertEq("", array[0]);
    this.assertEq(1, array.length);
    this.done();
  };
  
  self.extractArrayStringEmptyTrim = function () {
    var array = helper.extractArray(" ");
    this.assertEq(" ", array[0]);
    this.assertEq(1, array.length);
    
    array = helper.extractArray(" ", true);
    this.assertEq("", array[0]);
    this.assertEq(1, array.length);
    
    this.done();
  };
  
  self.extractArray = function () {
    var array = helper.extractArray("earth,life,love,inconditional");
    this.assertEq("earth", array[0]);
    this.assertEq("life", array[1]);
    this.assertEq("love", array[2]);
    this.assertEq("inconditional", array[3]);
    this.assertEq(4, array.length);
    this.done();
  };
  
  self.extractArrayTrim = function () {
    var array = helper.extractArray(" earth,  life,    love, inconditional  ", true);
    this.assertEq("earth", array[0]);
    this.assertEq("life", array[1]);
    this.assertEq("love", array[2]);
    this.assertEq("inconditional", array[3]);
    this.assertEq(4, array.length);
    this.done();
  };
  
  self.isNotFunction = function () {
    this.assertFalse(helper.isFunction(42));
    this.assertFalse(helper.isFunction(undefined));
    this.assertFalse(helper.isFunction(null));
    this.assertFalse(helper.isFunction("test"));
    this.assertFalse(helper.isFunction({}));
    this.assertFalse(helper.isFunction({test: "test"}));
    this.done();
  };
  
  self.isFunction = function () {
    var func = function() {};
    this.assertTrue(helper.isFunction(function() {}));
    this.assertTrue(helper.isFunction(func));
    this.done();
  };
  
  self.isNotObject = function () {
    this.assertFalse(helper.isObject(42));
    this.assertFalse(helper.isObject(undefined));
    this.assertFalse(helper.isObject("test"));
    this.assertFalse(helper.isObject(null));
    this.assertFalse(helper.isObject(function() {}));
    this.done();
  };
  
  self.isObject = function () {
    this.assertTrue(helper.isObject({}));
    this.assertTrue(helper.isObject({love: 42}));
    this.done();
  };
  
  self.getElaiJSAttribute = function () {
    this.assertEq("42", helper.getElaiJSAttribute("test"));
    this.assertEq("false", helper.getElaiJSAttribute("debug"));
    this.done();
  };
  
  self.clone = function() {
    var obj = {test: 42, love: "inconditional"};
    var cloneObj = helper.clone(obj);
    this.assertEq(obj.test, cloneObj.test);
    this.assertEq(obj.love, cloneObj.love);
    
    obj.test = 41;
    cloneObj.love = function() { };
    
    obj.onlyOrigine = true;
    cloneObj.onlyClone = true;
    
    this.assertEq(41, obj.test);
    this.assertEq(42, cloneObj.test);
    
    this.assertEq("inconditional", obj.love);
    this.assertFalse(helper.isFunction(obj.love));
    this.assertTrue(helper.isFunction(cloneObj.love));
    
    this.assertUndefined(obj.onlyClone);
    this.assertTrue(obj.onlyOrigine);
    this.assertUndefined(cloneObj.onlyOrigine);
    this.assertTrue(cloneObj.onlyClone);
    
    this.done();
  };
  
  self.capitalize = function () {
    this.assertEq("Test", helper.capitalize("test"));
    this.assertEq("TEST", helper.capitalize("TEST"));
    this.assertEq("TEsT", helper.capitalize("tEsT"));
    this.assertEq("TEST", helper.capitalize("tEST"));
    this.assertEq("Testtest", helper.capitalize("testtest"));
    
    this.done();
  };
  
  self.equalsStrict = function() {
    this.assertTrue(helper.equals(undefined, undefined));
    this.assertTrue(helper.equals(null, null));
    this.assertTrue(helper.equals(42, 42));
    this.assertTrue(helper.equals("42", "42"));
    this.assertTrue(helper.equals(true, true));
    this.assertTrue(helper.equals(false, false));
    this.assertTrue(helper.equals({}, {}));
    this.assertTrue(helper.equals({love: 42}, {love: 42}));
    this.assertTrue(helper.equals({love: 42, hope: "happy"}, {love: 42, hope: "happy"}));
    this.assertTrue(helper.equals({love: 42, hope: "happy", sun:{42: "love"}},
                                  {love: 42, hope: "happy", sun:{42: "love"}}));
    this.assertTrue(helper.equals({love: 42, hope: "happy", sun:{42: "love", fun: {child : false}}},
                                  {love: 42, hope: "happy", sun:{42: "love", fun: {child : false}}}));
    
    this.assertFalse(helper.equals(42, "42"));
    this.assertFalse(helper.equals(1, true));
    this.assertFalse(helper.equals(false, 0));
    this.assertFalse(helper.equals({love: 42}, {love: 42, sun: undefined}));

    this.assertFalse(helper.equals(undefined, null));
    this.assertFalse(helper.equals(null, false));
    this.assertFalse(helper.equals(42, 43));
    this.assertFalse(helper.equals("42", "43"));
    this.assertFalse(helper.equals(true, false));
    this.assertFalse(helper.equals(false, undefined));
    this.assertFalse(helper.equals({}, undefined));
    this.assertFalse(helper.equals({love: 42}, {love: 43}));
    this.assertFalse(helper.equals({love: 42}, {love2: 42}));
    this.assertFalse(helper.equals({love: 42, hope: "happy"}, {love: 42, hope: "happi"}));
    this.assertFalse(helper.equals({love: 42, hope: "happy", sun:{42: "love"}},
                                  {love: 42, hope: "happy", sun:{43: "love"}}));
    this.assertFalse(helper.equals({love: 42, hope: "happy", sun:{42: "love", fun: {children: false}}},
                                  {love: 42, hope: "happy", sun:{42: "love", fun: {child : false}}}));
    
    this.done();
  };
  
  self.equalsNotStrict = function() {
    this.assertTrue(helper.equals(42, "42", false));
    this.assertTrue(helper.equals(1, true, false));
    this.assertTrue(helper.equals(false, 0, false));
    this.assertTrue(helper.equals({love: 42}, {love: 42, sun: undefined}, false));
    
    var objComplexe = {love: 42, sun: undefined, hope: "happy"};
    this.assertFalse(helper.equals({love: 42}, objComplexe, false));
    this.assertFalse(helper.equals(objComplexe, {love: 42}, false));
    
    this.assertTrue(helper.equals(objComplexe, {love: 42, hope: "happy"}, false));
    
    this.done();
  };
  
  self.isEmail = function() {
    this.assertFalse(helper.isEmail());
    this.assertFalse(helper.isEmail(""));
    this.assertFalse(helper.isEmail("love"));
    this.assertFalse(helper.isEmail("love@"));
    this.assertFalse(helper.isEmail("love@.dq"));
    this.assertFalse(helper.isEmail("love@love"));
    this.assertFalse(helper.isEmail("love@love."));
    this.assertFalse(helper.isEmail("@love.love"));
    
    this.assertTrue(helper.isEmail("love@love.love"));
    this.assertTrue(helper.isEmail("love@love.lovelove"));
    this.assertTrue(helper.isEmail("e@e.fr"));
    this.assertTrue(helper.isEmail("love42@love.love"));
    
    this.done();
  };
  
	return self;
});