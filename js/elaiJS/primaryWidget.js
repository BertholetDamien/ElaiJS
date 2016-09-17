define(["elaiJS/widget", "elaiJS/multicallback", "elaiJS/binder",
				"elaiJS/helper", "elaiJS/promise"],
        function(widgetManager, multicallback, binder, helper, Promise) {
	'use strict';
	var properties = {};

	properties.parent = null;

	properties.builder = function() {

		this.create = function create(skipEvent) {
		  this.before("create", skipEvent);
		  var fireCallback = this.buildAfterCB("create", undefined, skipEvent);
		  return executeAsynCycleLifeFcts.call(this, "create", false).then(fireCallback);
		};
    
		this.initialize = function initialize(params, skipEvent) {
		  this.before("initialize", skipEvent);
      
      this.initializeVariables();
			this.params = params || {};
			
		  var fireCallback = this.buildAfterCB("initialize", undefined, skipEvent);
		  return executeAsynCycleLifeFcts.call(this, "initialize", false).then(fireCallback);
		};
		
		this.initializeVariables = function initializeVariables(skipEvent) {
		  this.before("initializeVariables", skipEvent);
		  
		  this.params = {};
		  this.renderParams = {};
		  initializeChildren.call(this);
		  
		  executeSyncCycleLifeFcts.call(this, "initializeVariables", false);
		  this.after("initializeVariables", skipEvent);
		};
		
		this.refresh = function refresh(skipEvent) {
		  this.before("refresh", skipEvent);
		  
		  var fireCallback = this.buildAfterCB("refresh", undefined, skipEvent);
		  return this.refreshData().then(function() {
		    return this.refreshRender(false).then(function() {
		      return callChildrenIfNeeded.call(this, "refresh").then(fireCallback);
		    });
		  });
		};
		
		this.refreshData = function refreshData(skipEvent) {
		  this.before("refreshData", skipEvent);
		  
		  return this.fetchData().then(function(rowData) {
		    this.setData(rowData, true);
		    this.after("refreshData", skipEvent);
		  });
		};
		
		this.fetchData = function fetchData(skipEvent) {
		  this.before("fetchData", skipEvent);
		  
		  var fireCallback = this.buildAfterCB("fetchData", undefined, skipEvent);
		  return executeAsynCycleLifeFcts.call(this, "fetchData", false).then(fireCallback);
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
		
		this.refreshRender = function refreshRender(callChildren, skipEvent) {
			this.before("refreshRender", skipEvent);
			var fireCallback = this.buildAfterCB("refreshRender", undefined, skipEvent);
		  return executeAsynCycleLifeFcts.call(this, "refreshRender", false).then(fireCallback);
		};

		this.render = function render(renderParams, skipEvent) {
			if(!this)
				console.log(renderParams);
		  this.before("render", skipEvent);
		  
		  this.renderParams = renderParams;
				
		  var fireCallback = this.buildAfterCB("render", undefined, skipEvent);
			return executeAsynCycleLifeFcts.call(this, "render", true).then(fireCallback);
		};
		
		this.removeRender = function removeRender(callChildren, skipEvent) {
		  this.before("removeRender", skipEvent);
		  executeSyncCycleLifeFcts.call(this, "removeRender", true);
		  this.after("removeRender", skipEvent);
		};

		this.reload = function reload(params, renderParams, skipEvent) {
		  this.before("reload", skipEvent);

			var fireCallback = this.buildAfterCB("reload", undefined, skipEvent);
			return this.initialize(params || this.params, function () {
				this.removeRender(false);
				return this.render(renderParams || this.renderParams).then(fireCallback);
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
		function executeAsynCycleLifeFcts(name, callChildren) {
		  var _this = this;
		  
      return this.callPluginsFct(name + "BeforeWidget").then(function() {
        return callInternalWidgetFct.call(_this, name).then(function(result) {
          return _this.callPluginsFct(name + "AfterWidget").then(function() {
            if(!callChildren)
          		return result;
            return callChildrenIfNeeded.call(_this, name).then(function() {
            	return result;
            });
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
		
		function callInternalWidgetFct(name) {
			return Promise.resolve().then(function() {
			  var fctName = "_" + name;
			  if(helper.isFunction(this[fctName]))
	        return this[fctName]();
			}.bind(this));
		}
		
		this.callPluginsFct = function callPluginsFct(name) {
		  this.before(name + "Plugins");
		  var fireCallback = this.buildAfterCB(name + "Plugins");
		  
		  var promises = [];
      for(var i in this.plugins) {
        var plugin = this.plugins[i].plugin;
        if(helper.isFunction(plugin[name]))
          promises.push(plugin[name].call(this));
      }
      
      return Promise.all(promises).then(fireCallback);
		};
		
		function callChildrenIfNeeded(name, overrideValue) {
			return Promise.resolve().then(function() {
			  var needChildren = isNeedChildren.call(this, name, overrideValue);
	      if(needChildren)
	        return this[name + "Children"]();
			}.bind(this));
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
		
		this.createChild = function createChild(widgetInfo, id, params, skipEvent) {
		  this.before("createChild", skipEvent);
		  
			if(!helper.isObject(widgetInfo))
        widgetInfo = {name: widgetInfo, mode: this.mode};
      else if(widgetInfo.mode === undefined)
        widgetInfo.mode = this.mode;
      
      var _this = this;
      var fireCallback = this.buildAfterCB("createChild", undefined, skipEvent);
			return widgetManager.create(widgetInfo, id, params).then(function (widget) {
				_this.addChild(widget);
				fireCallback(widget);
				return widget;
			});
		};
		
		this.createChildAndRender = function (widgetInfo, id, params, renderParams) {
		  return this.createChild(widgetInfo, id, params).then(function(child) {
		    return child.render(renderParams).then(function() {
		    	return child;
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
			return this.applyOnChildren("removeRender", undefined, skipEvent);
		};
		
		this.renderChildren = function renderChildren(skipEvent) {
			return this.applyOnChildren("render", function(child) {
			  return child.render(undefined);
			}, skipEvent);
		};

		this.reloadChildren = function reloadChildren(skipEvent) {
			return this.applyOnChildren("reload", function(child) {
			  return child.reload(undefined, undefined);
			}, skipEvent);
		};

		this.refreshChildren = function refreshChildren(skipEvent) {
		  return this.applyOnChildren("refresh", undefined, skipEvent);
		};
		
		this.destroyChildren = function destroyChildren(skipEvent) {
		  return this.applyOnChildren("destroy", undefined, skipEvent);
		};
		
		this.applyOnChildren = function applyOnChildren(actionName, action, skipEvent) {
			this.before(actionName + "Children", skipEvent);
			
			if(!action) {
				action = function(child) {
					return child[actionName]();
				};
			}
			
			var fireCallback = this.buildAfterCB(actionName + "Children", undefined, skipEvent);
			var promises = [];
			for(var key in this.children)
				promises.push(action(this.children[key]));
 			return Promise.all(promises).then(fireCallback);
		};
		
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
		
		this.scope = function(callback) {
      var _this = this;
      return function() {
      	return callback.apply(_this, arguments);
      };
    };
	};

	return properties;
});