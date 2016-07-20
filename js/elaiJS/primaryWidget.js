define(["elaiJS/widget", "elaiJS/multicallback", "elaiJS/binder", "elaiJS/helper"],
        function(widgetManager, multicallback, binder, helper) {
	'use strict';
	var properties = {};

	properties.parent = null;

	properties.builder = function() {

		this.create = function create(callback, skipEvent) {
		  this.before("create", skipEvent);
		  var fireCallback = this.buildAfterCB("create", callback, skipEvent);
		  executeAsynCycleLifeFcts.call(this, "create", false, fireCallback);
		};
    
		this.initialize = function initialize(params, callback, skipEvent) {
		  this.before("initialize", skipEvent);
      
      this.initializeVariables();
			this.params = params || {};
			
		  var fireCallback = this.buildAfterCB("initialize", callback, skipEvent);
		  executeAsynCycleLifeFcts.call(this, "initialize", false, fireCallback);
		};
		
		this.initializeVariables = function initializeVariables(skipEvent) {
		  this.before("initializeVariables", skipEvent);
		  
		  this.params = {};
		  this.renderParams = {};
		  initializeChildren.call(this);
		  
		  executeSyncCycleLifeFcts.call(this, "initializeVariables", false);
		  this.after("initializeVariables", skipEvent);
		};
		
		this.refresh = function refresh(callback, skipEvent) {
		  this.before("refresh", skipEvent);
		  
		  var fireCallback = this.buildAfterCB("refresh", callback, skipEvent);
		  this.refreshData(function() {
		    this.refreshRender(function() {
		      callChildrenIfNeeded.call(this, "refresh", fireCallback);
		    }, false);
		  });
		};
		
		this.refreshData = function refreshData(callback, skipEvent) {
		  this.before("refreshData", skipEvent);
		  
		  this.fetchData(function(rowData) {
		    this.setData(rowData, true);
		    this.after("refreshData", skipEvent);
		    if(helper.isFunction(callback))
		      callback.call(this);
		  });
		};
		
		this.fetchData = function fetchData(callback, skipEvent) {
		  this.before("fetchData", skipEvent);
		  
		  var fireCallback = this.buildAfterCB("fetchData", callback, skipEvent);
		  executeAsynCycleLifeFcts.call(this, "fetchData", false, fireCallback);
		};
		
		this.setData = function setData(data, needProcess, skipEvent) {
		  this.before("setData", skipEvent);
		  
		  if(needProcess) {
		    this.rowData = data;
		    this.data = this.processRowData();
		  }
		  else {
		    this.rowData = undefined;
		    this.data = data;
		  }
		  
		  this.fire("dataChanged", this.data);
		  this.after("setData", skipEvent);
		};
		
		this.processRowData = function processRowData(skipEvent) {
		  this.before("processRowData", skipEvent);
		  
		  var processedData = executeSyncCycleLifeFcts.call(this, "processRowData", false);
		  this.after("processRowData", skipEvent);
		  return processedData;
		};
		
		this.refreshRender = function refreshRender(callback, callChildren, skipEvent) {
			this.before("refreshRender", skipEvent);
			var fireCallback = this.buildAfterCB("refreshRender", callback, skipEvent);
		  executeAsynCycleLifeFcts.call(this, "refreshRender", false, fireCallback);
		};

		this.render = function render(renderParams, callback, skipEvent) {
		  this.before("render", skipEvent);
		  
		  this.renderParams = renderParams;
				
		  var fireCallback = this.buildAfterCB("render", callback, skipEvent);
			executeAsynCycleLifeFcts.call(this, "render", true, fireCallback);
		};
		
		this.removeRender = function removeRender(callChildren, skipEvent) {
		  this.before("removeRender", skipEvent);
		  executeSyncCycleLifeFcts.call(this, "removeRender", true);
		  this.after("removeRender", skipEvent);
		};

		this.reload = function reload(params, renderParams, callback, skipEvent) {
		  this.before("reload", skipEvent);

			var fireCallback = this.buildAfterCB("reload", callback, skipEvent);
			this.initialize(params || this.params, function () {
				this.removeRender(false);
				this.render(renderParams || this.renderParams, fireCallback);
			});
		};
		
		this.destroy = function destroy(skipEvent) {
		  this.before("destroy", skipEvent);
		  
		  this.destroyChildren();
		  this.remove(false);
		  this.unbindAll();
		  
		  executeSyncCycleLifeFcts.call(this, "destroy", false);
		  this.after("destroy", skipEvent);
		};
		
		this.remove = function (callChildren, skipEvent) {
		  this.before("remove", skipEvent);
		  
		  this.removeRender(callChildren);
		  if(widgetManager.get(this.id))
				widgetManager.remove(this);
			
			this.after("remove", skipEvent);
		};
		
		/**********************************************************************
		******************************* Helpers *******************************
		**********************************************************************/
		function executeAsynCycleLifeFcts(name, callChildren, callback) {
		  var _this = this;
      this.callPluginsFct(name + "BeforeWidget", function() {
        callInternalWidgetFct.call(_this, name, function(result) {
          _this.callPluginsFct(name + "AfterWidget", function() {
            if(callChildren)
              callChildrenIfNeeded.call(_this, name, function() {
                callback(result);
              });
            else
              callback(result);
          });
        });
      });
		}
		
		function executeSyncCycleLifeFcts(name, callChildren) {
      this.callPluginsFct(name + "BeforeWidget");
      var result = callInternalWidgetFct.call(this, name);
      this.callPluginsFct(name + "AfterWidget");
      if(callChildren)
        callChildrenIfNeeded.call(this, name);
      return result;
		}
		
		function callInternalWidgetFct(name, callback) {
		  var fctName = "_" + name;
		  if(helper.isFunction(this[fctName]))
        return this[fctName](callback);
      
      if(helper.isFunction(callback))
        callback();
		}
		
		this.callPluginsFct = function callPluginsFct(name, callback) {
		  this.before(name + "Plugins");
		  var fireCallback = this.buildAfterCB(name + "Plugins", callback);
		  
		  if(!this.plugins)
		    return fireCallback();
		  
		  var count = this.plugins.length;
		  var multiCallBackFunction = multicallback(count, fireCallback);
		  
      for(var i = 0 ; i < count ; ++i) {
        var plugin = this.plugins[i].plugin;
        if(helper.isFunction(plugin[name]))
          plugin[name].call(this, multiCallBackFunction);
        else if(multiCallBackFunction)
          multiCallBackFunction();
      }
		};
		
		function callChildrenIfNeeded(name, callback, overrideValue) {
		  var needChildren = isNeedChildren.call(this, name, overrideValue);
      if(needChildren)
        this[name + "Children"](callback);
      else if(helper.isFunction(callback))
        callback();
		}
		
		function isNeedChildren(name, defaultValue) {
		  defaultValue = defaultValue === undefined ? true : defaultValue;
		  var value = "need" + helper.capitalize(name) + "Children";
		  return getBooleanValue.call(this, value, defaultValue);
		}
		
		function getBooleanValue(name, defaultValue) {
		  var result = this[name];
	    if(helper.isFunction(this[name]))
        result = this[name]();
      
	    if(result === undefined)
	      result = defaultValue;
	     
     return result;
		}
		
		/**********************************************************************
		******************************* Childs ********************************
		**********************************************************************/
		this.findChild = function findChild(name, recursively) {
			for(var key in this.children) {
				var child = this.children[key];
				if(child.name.toLowerCase() === name.toLowerCase())
					return child;

				if(recursively) {
					var childResult = child.findChild(name, true);
					if(childResult)
						return childResult;
				}
			}
		};
		
		this.findChilds = function findChilds(name, recursively) {
			var result = [];
			for(var key in this.children) {
				var child = this.children[key];
				if(child.name.toLowerCase() === name.toLowerCase())
					result.push(child);
				
				if(recursively)
				  result = result.concat(child.findChilds(name, true));
			}

			return result;
		};

		this.addChild = function addChild(child, skipEvent) {
		  this.before("addChild", skipEvent);
		  
			this.children[child.id] = child;
			child.widgetParent = this;

			if(!widgetManager.get(child.id))
				widgetManager.add(child);

      this.after("addChild", skipEvent);
		};
		
		this.createChild = function createChild(widgetInfo, id, params, callback, skipEvent) {
		  this.before("createChild", skipEvent);
		  
			if(!helper.isObject(widgetInfo))
        widgetInfo = {name: widgetInfo, mode: this.mode};
      else if(widgetInfo.mode === undefined)
        widgetInfo.mode = this.mode;
      
      var _this = this;
      var fireCallback = this.buildAfterCB("createChild", callback, skipEvent);
			widgetManager.create(widgetInfo, id, params, function (widget) {
				_this.addChild(widget);
				fireCallback(widget);
			});
		};
		
		this.createChildAndRender = function (widgetInfo, id, params, renderParams, callback) {
		  this.createChild(widgetInfo, id, params, function(child) {
		  	var _this = this;
		    child.render(renderParams, function() {
		      if(helper.isFunction(callback))
		        callback.call(_this, child);
		    });
		  });
		};
		
		function initializeChildren() {
		  if(this.children && Object.keys(this.children).length > 0)
				this.destroyChildren();
			else
				this.children = {};
		}
		
		this.removeRenderChildren = function removeRender(skipEvent) {
			this.applyOnChildren("removeRender", undefined, undefined, skipEvent);
		};
		
		this.renderChildren = function renderChildren(callback, skipEvent) {
			this.applyOnChildren("render", function(child, next) {
			  child.render(undefined, next);
			}, callback, skipEvent);
		};

		this.reloadChildren = function reloadChildren(callback, skipEvent) {
			this.applyOnChildren("reload", function(child, next) {
			  child.reload(undefined, undefined, next);
			}, callback, skipEvent);
		};

		this.refreshChildren = function refreshChildren(callback, skipEvent) {
		  this.applyOnChildren("refresh", function(child, next) {
			  child.refresh(next);
			}, callback, skipEvent);
		};
		
		this.destroyChildren = function destroyChildren(skipEvent) {
		  this.applyOnChildren("destroy", undefined, undefined, skipEvent);
		};
		
		this.applyOnChildren = function applyOnChildren(actionName, action, callback, skipEvent) {
		  this.before(actionName + "Children", skipEvent);
		  
		  if(!action) {
		    action = function(child, next) {
		        child[actionName]();
		        next();
		    };
		  }
		  
		  var fireCallback = this.buildAfterCB(actionName + "Children", callback, skipEvent);
		  var multiCallBackFunction = getChildrenMutilCallback.call(this, fireCallback);
			for(var key in this.children) {
		    action(this.children[key], multiCallBackFunction);
			}
		};

		function getChildrenMutilCallback(callback) {
			var count = Object.keys(this.children).length;
			if(count === 0 && callback) {
				callback();
				return;
			}

			return multicallback(count, callback);
		}
		
		function addChildrenActionByID(action) {
		  this[action + "ChildByID"] = function(id, args) {
		    var wChild = this.children[id];
		    if(!wChild)
		      return;
		      
	      wChild[action].apply(wChild, args);
		  };
		}
		
		function addChildrenActionByName(action) {
		  this[action + "ChildsByName"] = function(name, args) {
		    var wChilds = this.findChilds(name);
		    for(var i in wChilds)
          wChilds[i][action].apply(wChilds[i], args);
		  };
		}
		
		addChildrenActionByID.call(this, "destroy");
		addChildrenActionByName.call(this, "destroy");

		/**********************************************************************
		******************************* Events ********************************
		**********************************************************************/
		binder.addAllFunctions(this);

		this.fire = function fireWidget(event, data) {
		  event = binder.buildEvent(event, data);
		  binder.fire.call(this, event);

      if(helper.isFunction(this[event.type]))
        this[event.type](event);
		};
		
    this.before = function before(functionName, skipEvent) {
      sendEvent.call(this, functionName, "before", skipEvent);
    };
    
    this.after = function after(functionName, skipEvent) {
      sendEvent.call(this, functionName, "after", skipEvent);
    };
    
    function sendEvent(functionName, suffix, skipEvent) {
      if(!skipEvent)
        this.fire(suffix + helper.capitalize(functionName));
    }
    
    this.buildAfterCB = function buildAfterCB(functionName, callback, skipEvent) {
      var _this = this;
      return function() {
        _this.after(functionName, skipEvent);
        if(helper.isFunction(callback))
          callback.apply(_this, arguments);
      };
    };
    
    this.async = function(callback, timeout, params) {
      var _this = this;
      setTimeout(function() {
        callback.apply(_this, params);
      }, timeout);
    };
	};

	return properties;
});