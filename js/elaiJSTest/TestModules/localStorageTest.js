  define([  "elaiJS/localStorage", "elaiJS/helper", "elaiJS/configuration"],
          function(localStorage, helper, config) {
	'use strict';
  var self = {};
  
  var path = "localPathTest";
  var path2 = "localPathTest2";
  var complexObj = {love: 42, happy: "hope", cute: {misscute: true}};
  
  self.beforeTest = function() {
    localStorage.clearAll();
  };
  
  self.getAndSet = function () {
    localStorage.set("love", 42);
    localStorage.set("hope", "happy");
    localStorage.set("sun", true);
    localStorage.set("cute", {});
    localStorage.set("verycute", {love: 42});
    localStorage.set("mywife", complexObj);
    
    this.assertEq(42, localStorage.get("love"));
    this.assertEq("happy", localStorage.get("hope"));
    this.assertEq(true, localStorage.get("sun"));
    this.assertTrue(helper.equals({}, localStorage.get("cute")));
    this.assertTrue(helper.equals({love: 42}, localStorage.get("verycute")));
    this.assertTrue(helper.equals(complexObj, localStorage.get("mywife")));
    
    this.done();
  };
  
  self.getAndSetWithPath = function () {
    this.assertNull(localStorage.get("love", path));
    this.assertNull(localStorage.get("hope", path));
    this.assertNull(localStorage.get("sun", path));
    this.assertNull(localStorage.get("cute", path));
    this.assertNull(localStorage.get("verycute", path));
    this.assertNull(localStorage.get("mywife", path));
    
    localStorage.set("love", 42, path);
    localStorage.set("hope", "happy", path);
    localStorage.set("sun", true, path);
    localStorage.set("cute", {}, path);
    localStorage.set("verycute", {love: 42}, path);
    localStorage.set("mywife", complexObj, path);
    
    this.assertEq(42, localStorage.get("love", path));
    this.assertEq("happy", localStorage.get("hope", path));
    this.assertEq(true, localStorage.get("sun", path));
    this.assertTrue(helper.equals({}, localStorage.get("cute", path)));
    this.assertTrue(helper.equals({love: 42}, localStorage.get("verycute", path)));
    this.assertTrue(helper.equals(complexObj, localStorage.get("mywife", path)));
    
    this.done();
  };
  
  self.getAndSetWithConfigPath = function () {
    config.storagePath = "defaultStorageTest";
    
    this.assertNull(localStorage.get("love"));
    this.assertNull(localStorage.get("hope"));
    this.assertNull(localStorage.get("sun"));
    this.assertNull(localStorage.get("cute"));
    this.assertNull(localStorage.get("verycute"));
    this.assertNull(localStorage.get("mywife"));
    
    localStorage.set("love", 42);
    localStorage.set("hope", "happy");
    localStorage.set("sun", true);
    localStorage.set("cute", {});
    localStorage.set("verycute", {love: 42});
    localStorage.set("mywife", complexObj);
    
    this.assertEq(42, localStorage.get("love"));
    this.assertEq("happy", localStorage.get("hope"));
    this.assertEq(true, localStorage.get("sun"));
    this.assertTrue(helper.equals({}, localStorage.get("cute")));
    this.assertTrue(helper.equals({love: 42}, localStorage.get("verycute")));
    this.assertTrue(helper.equals(complexObj, localStorage.get("mywife")));
    
    this.done();
  };
  
  self.remove = function () {
    this.assertEq(42, localStorage.get("love"));
    localStorage.remove("love");
    this.assertNull(localStorage.get("love"));

    this.assertTrue(helper.equals(complexObj, localStorage.get("mywife")));
    localStorage.remove("mywife");
    this.assertNull(localStorage.get("mywife"));
    
    this.done();
  };
  
  self.clear = function () {
    this.assertEq(42, localStorage.get("love", path));
    this.assertEq("happy", localStorage.get("hope", path));
    this.assertEq(true, localStorage.get("sun", path));
    this.assertTrue(helper.equals({}, localStorage.get("cute", path)));
    this.assertTrue(helper.equals({love: 42}, localStorage.get("verycute", path)));
    this.assertTrue(helper.equals(complexObj, localStorage.get("mywife", path)));
    
    this.assertNull(localStorage.get("love"));
    this.assertEq("happy", localStorage.get("hope"));
    this.assertEq(true, localStorage.get("sun"));
    this.assertTrue(helper.equals({}, localStorage.get("cute")));
    this.assertTrue(helper.equals({love: 42}, localStorage.get("verycute")));
    this.assertNull(localStorage.get("mywife"));
    
    localStorage.clear();
    
    this.assertNull(localStorage.get("love"));
    this.assertNull(localStorage.get("hope"));
    this.assertNull(localStorage.get("sun"));
    this.assertNull(localStorage.get("cute"));
    this.assertNull(localStorage.get("verycute"));
    this.assertNull(localStorage.get("mywife"));
    
    this.assertEq(42, localStorage.get("love", path));
    this.assertEq("happy", localStorage.get("hope", path));
    this.assertEq(true, localStorage.get("sun", path));
    this.assertTrue(helper.equals({}, localStorage.get("cute", path)));
    this.assertTrue(helper.equals({love: 42}, localStorage.get("verycute", path)));
    this.assertTrue(helper.equals(complexObj, localStorage.get("mywife", path)));
    
    this.done();
  };
  
  self.clearPath = function () {
    this.assertEq(42, localStorage.get("love", path));
    this.assertEq("happy", localStorage.get("hope", path));
    this.assertEq(true, localStorage.get("sun", path));
    this.assertTrue(helper.equals({}, localStorage.get("cute", path)));
    this.assertTrue(helper.equals({love: 42}, localStorage.get("verycute", path)));
    this.assertTrue(helper.equals(complexObj, localStorage.get("mywife", path)));
    
    localStorage.clear(path);
    
    this.assertNull(localStorage.get("love", path));
    this.assertNull(localStorage.get("hope", path));
    this.assertNull(localStorage.get("sun", path));
    this.assertNull(localStorage.get("cute", path));
    this.assertNull(localStorage.get("verycute", path));
    this.assertNull(localStorage.get("mywife", path));
    
    this.done();
  };
  
  self.clearAll = function () {
    localStorage.set("love", 42, path);
    localStorage.set("hope", "happy", path);
    localStorage.set("sun", true, path);
    localStorage.set("cute", {}, path);
    localStorage.set("verycute", {love: 42}, path);
    localStorage.set("mywife", complexObj, path);
    
    this.assertEq(42, localStorage.get("love", path));
    this.assertEq("happy", localStorage.get("hope", path));
    this.assertEq(true, localStorage.get("sun", path));
    this.assertTrue(helper.equals({}, localStorage.get("cute", path)));
    this.assertTrue(helper.equals({love: 42}, localStorage.get("verycute", path)));
    this.assertTrue(helper.equals(complexObj, localStorage.get("mywife", path)));

    localStorage.set("love", 42, path2);
    localStorage.set("hope", "happy", path2);
    localStorage.set("sun", true, path2);
    localStorage.set("cute", {}, path2);
    localStorage.set("verycute", {love: 42}, path2);
    localStorage.set("mywife", complexObj, path2);
    
    this.assertEq(42, localStorage.get("love", path2));
    this.assertEq("happy", localStorage.get("hope", path2));
    this.assertEq(true, localStorage.get("sun", path2));
    this.assertTrue(helper.equals({}, localStorage.get("cute", path2)));
    this.assertTrue(helper.equals({love: 42}, localStorage.get("verycute", path2)));
    this.assertTrue(helper.equals(complexObj, localStorage.get("mywife", path2)));
    
    localStorage.clearAll();
    
    this.assertNull(localStorage.get("love"), path);
    this.assertNull(localStorage.get("hope"), path);
    this.assertNull(localStorage.get("sun"), path);
    this.assertNull(localStorage.get("cute"), path);
    this.assertNull(localStorage.get("verycute"), path);
    this.assertNull(localStorage.get("mywife"), path);
    
    this.assertNull(localStorage.get("love"), path2);
    this.assertNull(localStorage.get("hope"), path2);
    this.assertNull(localStorage.get("sun"), path2);
    this.assertNull(localStorage.get("cute"), path2);
    this.assertNull(localStorage.get("verycute"), path2);
    this.assertNull(localStorage.get("mywife"), path2);
    
    this.done();
  };

  self.bind = function () {
    var loveCount = 0;
    var hopeCount = 0;
    localStorage.bindTab("loveBind", function() {
      ++loveCount;
    }, path);
    
    localStorage.bindTab("hopeBind", function() {
      ++hopeCount;
    });
    
    this.assertEq(0, loveCount);
    this.assertEq(0, hopeCount);
    
    localStorage.set("loveBind", 42, path);
    
    this.assertEq(1, loveCount);
    this.assertEq(0, hopeCount);

    localStorage.set("hopeBind", "happy");
    
    this.assertEq(1, loveCount);
    this.assertEq(1, hopeCount);
    
    localStorage.set("loveBind", 42, path);
    localStorage.set("loveBind", 43, path);
    localStorage.set("loveBind", 42, path);
    localStorage.set("loveBind", 43, path);
    
    localStorage.set("hopeBind", "sun", path);
    localStorage.set("hopeBind", "sun");
    localStorage.set("hopeBind", "happy");
    localStorage.set("hopeBind", "sun");
    localStorage.set("hopeBind", "happy");
    localStorage.set("hopeBind", "sun");
    localStorage.set("hopeBind", "happy");
    
    this.assertEq(4, loveCount);
    this.assertEq(7, hopeCount);
    
    localStorage.remove("hopeBind");
    this.assertEq(8, hopeCount);
    
    this.done();
  };
  
	return self;
});