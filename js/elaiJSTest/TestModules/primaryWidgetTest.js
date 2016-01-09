define(["elaiJS/configuration", "elaiJS/widget", "elaiJS/helper"],
          function(config, widgetManager, helper) {
	'use strict';
  var self = {};

  self.beforeTest = function() {
    config.defaultPlugins = undefined;
    config.ressources.widgets = "elaiJSTest/TestModules/TestWidgets";
    config.ressources.widgetCSS = "elaiJSTest/TestModules/TestWidgets/{{name}}.css";
  };

  self.createWidgetWithParams = function(test) {
    widgetManager.create("widget1", "w1", {love: 42}, function(widget) {
      test.assertEq("w1", widget.id);
      test.assertEq(42, widget.params.love);
      test.assertEq(42, widget.love);
      
      test.done();
    });
  };
  
  self.internalCycleLife = function(test) {
    widgetManager.create("widget1", "internalCycleLife", {love: 42}, function(widget) {
      test.assertEq("internalCycleLife", widget.id);
      test.assertTrue(widget.created);
      
      test.assertEq(1, widget.count.init);
      test.assertEq(1, widget.count.initVars);
      
      widget.render();
      test.assertEq(1, widget.count.render);
      
      widget.reload();
      test.assertEq(2, widget.count.init);
      test.assertEq(2, widget.count.initVars);
      test.assertEq(2, widget.count.render);
      test.assertEq(1, widget.count.removeRender);
      
      widget.refresh();
      test.assertEq(1, widget.count.fetchData);
      test.assertEq(1, widget.count.processRowData);
      test.assertEq(1, widget.count.refreshRender);
      
      widget.initialize();
      test.assertEq(3, widget.count.init);
      test.assertEq(3, widget.count.initVars);
      
      widget.initializeVariables();
      test.assertEq(3, widget.count.init);
      test.assertEq(4, widget.count.initVars);
      
      widget.refreshData();
      test.assertEq(2, widget.count.fetchData);
      test.assertEq(2, widget.count.processRowData);
      
      widget.processRowData();
      test.assertEq(3, widget.count.processRowData);  
      
      widget.fetchData();
      test.assertEq(3, widget.count.fetchData);
      
      widget.refreshRender();
      test.assertEq(2, widget.count.refreshRender);
      
      test.done();
    });
  };
  
  self.refreshData = function(test) {
    var widget = widgetManager.get("w1");
    widget._fetchData = function(callback) {
      callback({hope: "happy", love: 42});
    };
    
    widget._processRowData = function() {
      var data = {};
      data.love = this.rowData.love + 1;
      data.hope = this.rowData.hope;
      data.sun = this.rowData.love - 1;
      return data;
    };
    
    widget.refreshData(function() {
      test.assertEq(42, widget.rowData.love);
      test.assertEq("happy", widget.rowData.hope);
      
      test.assertEq(43, widget.data.love);
      test.assertEq("happy", widget.data.hope);
      test.assertEq(41, widget.data.sun);
      
      test.done();
    });
  };
  
  self.setData = function(test) {
    var widget = widgetManager.get("w1");
    widget.setData({hohope: "hahapy", love: 42}, false);
    
    this.assertUndefined(widget.rowData);
      
    this.assertEq(42, widget.data.love);
    this.assertEq("hahapy", widget.data.hohope);
    
    widget.setData({hope: "veryhappy", love: 41}, true);
    
    this.assertEq(41, widget.rowData.love);
    this.assertEq("veryhappy", widget.rowData.hope);
      
    this.assertEq(42, widget.data.love);
    this.assertEq("veryhappy", widget.data.hope);
    this.assertEq(40, widget.data.sun);
    
    widget.setData({happy: "hope", biglove: 4242});
    
    this.assertUndefined(widget.rowData);
      
    this.assertEq(4242, widget.data.biglove);
    this.assertEq("hope", widget.data.happy);
    
    this.done();
  };
  
  self.bind = function() {
    var widget = widgetManager.get("w1");
    
    var count = 0;
    widget.testEvent = function() {
      ++count;
    };
    
    this.assertEq(0, count);
    
    widget.testEvent();
    this.assertEq(1, count);
    
    widget.fire("testEvent");
    this.assertEq(2, count);
    
    widget.fire("testEvent");
    widget.fire("testEvent");
    this.assertEq(4, count);
    
    widget.fire("testEvent");
    widget.fire("testEvent");
    widget.testEvent();
    this.assertEq(7, count);
    
    this.done();
  };
  
  self.remove = function() {
    var widget = widgetManager.get("w1");
    var here = false;
    widget._removeRender = function() {
      here = true;
    };
    
    this.assertFalse(here);
    widget.remove();
    this.assertTrue(here);
    
    this.assertUndefined(widgetManager.get("w1"));
    
    widgetManager.add(widget);
    this.assertDefined(widgetManager.get("w1"));
    
    this.done();
  };
  
  self.destroy = function() {
    var widget = widgetManager.get("w1");
    var here = false;
    var hereD = false;
    widget._removeRender = function() {
      here = true;
    };
    
    widget._destroy = function() {
      hereD = true;
    };
    
    var countTestEvent = 0;
    widget.bind("test", function() {
      ++countTestEvent;
    });
    
    this.assertEq(0, countTestEvent);
    widget.fire("test");
    this.assertEq(1, countTestEvent);
    
    this.assertFalse(here);
    this.assertFalse(hereD);
    widget.destroy();
    this.assertTrue(here);
    this.assertTrue(hereD);
    
    widget.fire("test");
    this.assertEq(1, countTestEvent);
    
    this.assertUndefined(widgetManager.get("w1"));
    
    widgetManager.add(widget);
    this.assertDefined(widgetManager.get("w1"));
    
    this.done();
  };
  
  self.cycleLifePreparation = function(test) {
    widgetManager.create("widget2", "cycleLife", undefined, function(widget) {
      widget.addEventFunctions();
      widget.create(function() {
        checkCycleResult(test, widget.cycleLife, getCycleLife("create"));
      });
    });
  };
  
  self.cycleLifeInit = function(test) {
    var widget = widgetManager.get("cycleLife");
    widget.cycleLife = [];
    
    widget.initialize({}, function() {
      checkCycleResult(test, widget.cycleLife,
              ["beforeInitialize"]
                .concat(getCycleLife("initializeVariables"))
                .concat(endCycleLife("initialize")));
    });
  };
  
  self.cycleLifeInitVar = function(test) {
    var widget = widgetManager.get("cycleLife");
    widget.cycleLife = [];
    
    widget.initializeVariables();
    checkCycleResult(test, widget.cycleLife, getCycleLife("initializeVariables"));
  };
  
  self.cycleLifeRefresh = function(test) {
    var widget = widgetManager.get("cycleLife");
    widget.cycleLife = [];
    
    widget.refresh(function() {
      checkCycleResult(test, widget.cycleLife,
              ["beforeRefresh"]
                .concat(getRefreshDataCycleLife())
                .concat(getCycleLife("refreshRender"))
                .concat("beforeRefreshChildren", "afterRefreshChildren")
                .concat("afterRefresh"));
    });
  };
  
  self.cycleLifeRefreshData = function(test) {
    var widget = widgetManager.get("cycleLife");
    widget.cycleLife = [];
    
    widget.refreshData(function() {
      checkCycleResult(test, widget.cycleLife, getRefreshDataCycleLife());
    });
  };
  
  self.cycleLifeFetchData = function(test) {
    var widget = widgetManager.get("cycleLife");
    widget.cycleLife = [];
    
    widget.fetchData(function() {
      checkCycleResult(test, widget.cycleLife, getCycleLife("fetchData"));
    });
  };
  
  self.cycleLifeProcessRowData = function(test) {
    var widget = widgetManager.get("cycleLife");
    widget.cycleLife = [];
    
    widget.processRowData();
    checkCycleResult(test, widget.cycleLife, getCycleLife("processRowData"));
  };
  
  self.cycleLifeSetData = function(test) {
    var widget = widgetManager.get("cycleLife");
    widget.cycleLife = [];
    
    widget.setData({}, true);
    checkCycleResult(test, widget.cycleLife, ["beforeSetData"]
                                              .concat(getCycleLife("processRowData"))
                                              .concat(["afterSetData"]), false);
    
    widget.cycleLife = [];
    widget.setData({}, false);
    checkCycleResult(test, widget.cycleLife, ["beforeSetData", "afterSetData"], false);
    
    widget.cycleLife = [];
    widget.setData({});
    checkCycleResult(test, widget.cycleLife, ["beforeSetData", "afterSetData"]);
  };
  
  self.cycleLifeRefreshRender = function(test) {
    var widget = widgetManager.get("cycleLife");
    widget.cycleLife = [];
    
    widget.refreshRender(function() {
      checkCycleResult(test, widget.cycleLife, getCycleLife("refreshRender"));
    });
  };
  
  self.cycleLifeRender = function(test) {
    var widget = widgetManager.get("cycleLife");
    widget.cycleLife = [];
    
    widget.render({}, function() {
      checkCycleResult(test, widget.cycleLife, getCycleLife("render", true));
    });
  };
  
  self.cycleLifeReload = function(test) {
    var widget = widgetManager.get("cycleLife");
    widget.cycleLife = [];
    
    widget.reload({}, {}, function() {
      checkCycleResult(test, widget.cycleLife,
              ["beforeReload"]
                .concat("beforeInitialize")
                .concat(getCycleLife("initializeVariables"))
                .concat(endCycleLife("initialize"))
                .concat(getCycleLife("removeRender", true))
                .concat(getCycleLife("render", true))
                .concat("afterReload"));
    });
  };
  
  self.cycleLifeRemoveRender = function(test) {
    var widget = widgetManager.get("cycleLife");
    widget.cycleLife = [];
    
    widget.removeRender();
    checkCycleResult(test, widget.cycleLife, getCycleLife("removeRender", true));
  };
  
  self.cycleLifeRemove = function(test) {
    var widget = widgetManager.get("cycleLife");
    widget.cycleLife = [];
    
    widget.remove();
    checkCycleResult(test, widget.cycleLife, []
                .concat("beforeRemove")
                .concat(getCycleLife("removeRender", true))
                .concat("afterRemove")
    );
    
    widgetManager.add(widget);
  };
  
  self.cycleLifeDestroy = function(test) {
    var widget = widgetManager.get("cycleLife");
    widget.cycleLife = [];
    
    widget.destroy();
    checkCycleResult(test, widget.cycleLife, []
                .concat("beforeDestroy")
                .concat(["beforeDestroyChildren", "afterDestroyChildren"])
                .concat("beforeRemove")
                .concat(getCycleLife("removeRender", true))
                .concat("afterRemove")
                .concat(endCycleLife("destroy")));
  };
  
  
  function getRefreshDataCycleLife() {
    return ["beforeRefreshData"]
            .concat(getCycleLife("fetchData"))
            .concat(["beforeSetData"])
            .concat(getCycleLife("processRowData"))
            .concat(["afterSetData", "afterRefreshData"]);
  }
  
  function getCycleLife(name, children) {
    var capiName = helper.capitalize(name);
    return ["before" + capiName].concat(endCycleLife(name, children));
  }
  
  function endCycleLife(name, children) {
    var capiName = helper.capitalize(name);
    var result = [
            "before" + capiName + "BeforeWidgetPlugins",
            "_" + name,
            "after" + capiName + "AfterWidgetPlugins"];
    if(children)
      result = result.concat(["before" + capiName + "Children", "after" + capiName + "Children"]);
    
    return result.concat("after" + capiName);
  }
  
  function checkCycleResult(test, result, wishResult, done) {
    if(wishResult.length != result.length) {
      test.error("Cycle result length don't match.");
      console.error("Cycle result length don't match - %o %o ", wishResult, result);
      return;
    }
    
    for(var i = 0 ; i < wishResult.length ; ++i)
      test.assertEq(wishResult[i], result[i]);
    
    if(done !== false)
      test.done();
  }
  
  self.addChild = function(test) {
    widgetManager.create("widget1", "parent1", undefined, function(wParent) {
      widgetManager.create("widget1", "child1", undefined, function(wChild1) {
        test.assertDefined(widgetManager.get(wChild1.id));
        wChild1.remove();
        test.assertUndefined(widgetManager.get(wChild1.id));
        
        test.assertEq(0, Object.keys(wParent.children).length);
        wParent.addChild(wChild1);
        test.assertDefined(widgetManager.get(wChild1.id));
        test.assertEq(1, Object.keys(wParent.children).length);
        test.assertEq(wChild1, wParent.children["child1"]);
        test.assertEq(wParent, wChild1.widgetParent);
        test.done();
      });
    });
  };
  
  self.addChildMultiple = function(test) {
    var wParent = widgetManager.get("parent1");
    widgetManager.create("widget2", "child2", undefined, function(wChild2) {
      test.assertEq(1, Object.keys(wParent.children).length);
      wParent.addChild(wChild2);
      
      test.assertEq(2, Object.keys(wParent.children).length);
      wParent.addChild(wChild2);
      test.assertEq(2, Object.keys(wParent.children).length);
      
      test.assertEq(wChild2, wParent.children["child2"]);
      test.assertEq(wParent, wChild2.widgetParent);
      test.done();
    });
  };
  
  self.removeWithChild = function(test) {
    var wParent = widgetManager.get("parent1");
    var wChild1 = widgetManager.get("child1");
    var wChild2 = widgetManager.get("child2");
    
    this.assertDefined(widgetManager.get(wParent.id));
    this.assertDefined(widgetManager.get(wChild1.id));
    this.assertDefined(widgetManager.get(wChild2.id));
    
    wParent.remove();
    
    this.assertUndefined(widgetManager.get(wParent.id));
    this.assertUndefined(widgetManager.get(wChild1.id));
    this.assertUndefined(widgetManager.get(wChild2.id));
    
    widgetManager.add(wParent);
    
    this.assertDefined(widgetManager.get(wParent.id));
    this.assertDefined(widgetManager.get(wChild1.id));
    this.assertDefined(widgetManager.get(wChild2.id));
    
    this.done();
  };
  
  self.createChild = function(test) {
    var wChild1 = widgetManager.get("child1");
    this.assertEq(0, Object.keys(wChild1.children).length);
    
    wChild1.createChild("widget2", "subchild2", undefined, function(wSubChild2) {
      test.assertDefined(widgetManager.get(wSubChild2.id));
      
      test.assertEq(1, Object.keys(wChild1.children).length);
      test.assertEq(wSubChild2, wChild1.children["subchild2"]);
      test.assertEq(wChild1, wSubChild2.widgetParent);
      test.done();
    });
  };
  
  self.findChild = function() {
    var wParent = widgetManager.get("parent1");
    var wChild1 = widgetManager.get("child1");
    var wChild2 = widgetManager.get("child2");
    var wSubChild2 = widgetManager.get("subchild2");
    
    this.assertEq(wChild1, wParent.findChild("widget1", undefined));
    this.assertEq(wChild2, wParent.findChild("widget2", undefined));
    this.assertUndefined(wParent.findChild("widget42", undefined));
    
    this.assertEq(wChild1, wParent.findChild("widget1", false));
    this.assertEq(wChild2, wParent.findChild("widget2", false));
    this.assertUndefined(wParent.findChild("widget42", false));
    
    this.assertEq(wChild1, wParent.findChild("widget1", true));
    this.assertEq(wSubChild2, wParent.findChild("widget2", true));
    this.assertUndefined(wParent.findChild("widget42", true));
    
    this.done();
  };
    
  self.findChilds = function() {
    var wParent = widgetManager.get("parent1");
    
    this.assertEq(1, wParent.findChilds("widget1").length);
    this.assertEq(1, wParent.findChilds("widget2").length);
    this.assertEq(0, wParent.findChilds("widget42").length);

    this.assertEq(1, wParent.findChilds("widget1", false).length);
    this.assertEq(1, wParent.findChilds("widget2", false).length);
    this.assertEq(0, wParent.findChilds("widget42", false).length);
    
    this.assertEq(1, wParent.findChilds("widget1", true).length);
    this.assertEq(2, wParent.findChilds("widget2", true).length);
    this.assertEq(0, wParent.findChilds("widget42", true).length);
    
    this.done();
  };
  
  self.widgetParent1 = function(test) {
    widgetManager.create("widgetParent1", "widgetParent1", undefined, function(widget) {
      test.assertEq(1, widget.only1());
      test.assertUndefined(widget.only2);
      test.assertUndefined(widget.only3);
      
      test.assertEq(1, widget.all());
      test.assertEq("1", widget.parent());
      
      test.done();
    });
  };
  
  self.widgetParent2 = function(test) {
    widgetManager.create("widgetParent2", "widgetParent2", undefined, function(widget) {
      test.assertEq(1, widget.only1());
      test.assertEq(2, widget.only2());
      test.assertUndefined(widget.only3);
      
      test.assertEq(1, widget.super.all());
      
      test.assertEq(2, widget.all());
      test.assertEq("21", widget.parent());
      
      test.done();
    });
  };
  
  self.widgetParent3 = function(test) {
    widgetManager.create("widgetParent3", "widgetParent3", undefined, function(widget) {
      test.assertEq(1, widget.only1());
      test.assertEq(2, widget.only2());
      test.assertEq(3, widget.only3());
      
      test.assertEq(2, widget.super.all());
      test.assertEq(1, widget.super.super.all());
      
      test.assertEq(3, widget.all());
      test.assertEq("321", widget.parent());
      
      test.done();
    });
  };
  
  self.widgetPrivate = function(test) {
    var widgetParent1 = widgetManager.get("widgetParent1");
    var widgetParent2 = widgetManager.get("widgetParent2");
    var widgetParent3 = widgetManager.get("widgetParent3");
    
    this.assertEq(1, widgetParent1.priv());
    this.assertEq(2, widgetParent1.priv());
    this.assertEq(3, widgetParent1.priv());
    
    
    this.assertEq(1, widgetParent2.priv());
    this.assertEq(2, widgetParent2.priv());
    this.assertEq(3, widgetParent2.priv());
    
    this.assertEq(1, widgetParent2.super.priv());
    this.assertEq(2, widgetParent2.super.priv());
    this.assertEq(3, widgetParent2.super.priv());
    
    
    this.assertEq(1, widgetParent3.priv());
    this.assertEq(2, widgetParent3.priv());
    this.assertEq(3, widgetParent3.priv());
    
    this.assertEq(1, widgetParent3.super.priv());
    this.assertEq(2, widgetParent3.super.priv());
    this.assertEq(3, widgetParent3.super.priv());
    
    this.assertEq(1, widgetParent3.super.super.priv());
    this.assertEq(2, widgetParent3.super.super.priv());
    this.assertEq(3, widgetParent3.super.super.priv());
    
    this.done();
  };
  
  self.widgetPrivateStatic = function(test) {
    var widgetParent1 = widgetManager.get("widgetParent1");
    var widgetParent2 = widgetManager.get("widgetParent2");
    var widgetParent3 = widgetManager.get("widgetParent3");
    
    this.assertEq(1, widgetParent1.privStatic());
    this.assertEq(2, widgetParent1.privStatic());
    this.assertEq(3, widgetParent1.privStatic());
    
    
    this.assertEq(1, widgetParent2.privStatic());
    this.assertEq(2, widgetParent2.privStatic());
    this.assertEq(3, widgetParent2.privStatic());
    
    this.assertEq(4, widgetParent2.super.privStatic());
    this.assertEq(5, widgetParent2.super.privStatic());
    this.assertEq(6, widgetParent2.super.privStatic());
    
    
    this.assertEq(1, widgetParent3.privStatic());
    this.assertEq(2, widgetParent3.privStatic());
    this.assertEq(3, widgetParent3.privStatic());
    
    this.assertEq(4, widgetParent3.super.privStatic());
    this.assertEq(5, widgetParent3.super.privStatic());
    this.assertEq(6, widgetParent3.super.privStatic());
    
    this.assertEq(7, widgetParent3.super.super.privStatic());
    this.assertEq(8, widgetParent3.super.super.privStatic());
    this.assertEq(9, widgetParent3.super.super.privStatic());
    
    this.done();
  };
  
	return self;
});