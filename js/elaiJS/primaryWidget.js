define(["elaiJS/widget", "elaiJS/binder", "elaiJS/helper", "elaiJS/promise"],
				function(widgetManager, binder, helper, Promise) {
	'use strict';
	var properties = {};
	properties.parent = null;

	properties.builder = function() {

		this.create = function create(skipEvent) {
			return this.processAction("create", false, undefined, skipEvent);
		};
		
		this.initialize = function initialize(params, skipEvent) {
			return this.processAction("initialize", false, function() {
				this.params = params || {};
				this.renderParams = {};
				return this.destroyChildren();
			}, skipEvent);
		};
		
		this.refresh = function refresh(skipEvent) {
			this.before("refresh", skipEvent);
			
			var fireCallback = this.buildAfterCB("refresh", undefined, skipEvent);
			return this.refreshData().then(function() {
				return this.refreshRender(false).then(function() {
					return callChildrenIfNeeded.call(this, "refresh").then(fireCallback);
				}.bind(this));
			}.bind(this));
		};
		
		this.refreshData = function refreshData(skipEvent) {
			this.before("refreshData", skipEvent);
			
			var fireCallback = this.buildAfterCB("refreshData", undefined, skipEvent);
			return this.fetchData().then(function(rawData) {
				return this.setData(rawData, true).then(fireCallback);
			}.bind(this));
		};
		
		this.fetchData = function fetchData(skipEvent) {
			return this.processAction("fetchData", false, undefined, skipEvent);
		};
		
		this.setData = function setData(data, needProcess, skipEvent) {
			this.before("setData", skipEvent);

			var promise;

			if(needProcess) {
				this.rawData = data;
				promise = this.processRawData().then(function(result) {
					this.data = result;
				}.bind(this));
			}
			else {
				this.rawData = undefined;
				this.data = data;
				promise = Promise.resolve();
			}
			
			var fireCallback = this.buildAfterCB("setData", undefined, skipEvent);
			return promise.then(fireCallback);
		};
		
		this.processRawData = function processRawData(skipEvent) {
			return this.processAction("processRawData", false, undefined, skipEvent);
		};
		
		this.refreshRender = function refreshRender(callChildren, skipEvent) {
			return this.processAction("refreshRender", false, undefined, skipEvent);
		};

		this.render = function render(renderParams, skipEvent) {
			return this.processAction("render", true, function() {
				this.renderParams = renderParams;
			}, skipEvent);
		};
		
		this.removeRender = function removeRender(callChildren, skipEvent) {
			return this.processAction("removeRender", true, undefined, skipEvent);
		};

		this.reload = function reload(params, renderParams, skipEvent) {
			this.before("reload", skipEvent);

			var fireCallback = this.buildAfterCB("reload", undefined, skipEvent);
			return this.initialize(params || this.params).then(function () {
				return this.removeRender(false).then(function() {
					return this.render(renderParams || this.renderParams).then(fireCallback);
				}.bind(this));
			}.bind(this));
		};
		
		this.destroy = function destroy(skipEvent) {
			return this.processAction("destroy", false, function() {
				if(this.widgetParent)
					delete this.widgetParent.children[this.id];

				return this.destroyChildren().then(function() {
					return this.remove(false).then(this.unbindAll.bind(this));
				}.bind(this));
			}, skipEvent);
		};
		
		this.remove = function (callChildren, skipEvent) {
			this.before("remove", skipEvent);
			
			return this.removeRender(callChildren).then(function() {
				if(widgetManager.get(this.id))
					widgetManager.remove(this);
				
				this.after("remove", skipEvent);
			}.bind(this));
		};
		
		/**********************************************************************
		******************************* Helpers *******************************
		**********************************************************************/
		this.processAction = function(actionName, callChildren, duringAction, skipEvent) {
			this.before(actionName, skipEvent);

			var promise = Promise.resolve();
			if(helper.isFunction(duringAction))
				promise = promise.then(duringAction.bind(this));

			return promise.then(function() {
				var fireCallback = this.buildAfterCB(actionName, undefined, skipEvent);
				return executeAsynCycleLifeFcts.call(this, actionName, callChildren).then(fireCallback);
			}.bind(this));
		};

		function executeAsynCycleLifeFcts(name, callChildren) {
			return this.callPluginsFct(name + "BeforeWidget").then(function() {
				return callInternalWidgetFctPromise.call(this, name).then(function(result) {
					return this.callPluginsFct(name + "AfterWidget").then(function() {
						if(!callChildren)
							return result;
						return callChildrenIfNeeded.call(this, name).then(function() {
							return result;
						}.bind(this));
					}.bind(this));
				}.bind(this));
			}.bind(this));
		}
		
		function callInternalWidgetFctPromise(name) {
			return Promise.resolve(name).then(callInternalWidgetFct.bind(this));
		}

		function callInternalWidgetFct(name) {
			var fctName = "_" + name;
			if(helper.isFunction(this[fctName]))
				return this[fctName]();
		}
		
		this.callPluginsFct = function callPluginsFct(name) {
			this.before(name + "Plugins");
			
			var promises = [];
			for(var i in this.plugins) {
				var plugin = this.plugins[i].plugin;
				if(helper.isFunction(plugin[name]))
					promises.push(plugin[name].call(this));
			}
			
			var fireCallback = this.buildAfterCB(name + "Plugins");
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
		this.children = {};

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
			
			var fireCallback = this.buildAfterCB("createChild", undefined, skipEvent);
			return widgetManager.create(widgetInfo, id, params).then(function (widget) {
				this.addChild(widget);
				fireCallback(widget);
				return widget;
			}.bind(this));
		};
		
		this.createChildAndRender = function (widgetInfo, id, params, renderParams) {
			return this.createChild(widgetInfo, id, params).then(function(child) {
				return child.render(renderParams).then(function() {
					return child;
				});
			});
		};
		
		this.removeRenderChildren = function removeRender(skipEvent) {
			return this.applyOnChildren("removeRender", undefined, skipEvent);
		};
		
		this.renderChildren = function renderChildren(skipEvent) {
			return this.applyOnChildren("render", undefined, skipEvent);
		};

		this.reloadChildren = function reloadChildren(skipEvent) {
			return this.applyOnChildren("reload", undefined, skipEvent);
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
					return Promise.resolve();
					
				return wChild[action].apply(wChild, args);
			};
		}
		
		function addChildrenActionByName(action) {
			this[action + "ChildsByName"] = function(name, args) {
				var wChilds = this.findChilds(name);
				var promises = [];
				for(var i in wChilds)
					promises.push(wChilds[i][action].apply(wChilds[i], args));
				return Promise.all(promises);
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
			if(skipEvent !== true)
				this.fire(suffix + helper.capitalize(functionName));
		}
		
		this.buildAfterCB = function buildAfterCB(functionName, callback, skipEvent) {
			return function(result) {
				this.after(functionName, skipEvent);
				if(helper.isFunction(callback))
					callback.apply(this, arguments);
				return result;
			}.bind(this);
		};
		
		this.async = function(callback, timeout, params) {
			setTimeout(function() {
				callback.apply(this, params);
			}.bind(this), timeout);
		};
	};

	return properties;
});