define(["elaiJS/helper"], function(helper) {
	'use strict';

	var self = {};
	var globalEvent = {};
	
	self.bindOne = function bindOne(type, callback, params, scope) {
		return self.bind.call(this, type, callback, params, scope, true);
	};

	self.bind = function bind(type, callback, params, scope, bindOne) {
		if(!helper.isFunction(callback))
			throw new Error("callback argument need to be a function.");

		this.listeners = this.listeners || {};
		this.listeners[type] = this.listeners[type] || [];

		var listener = {callback: callback, params: params,
										scope: scope, bindOne: bindOne};
		this.listeners[type].push(listener);
		
		return this;
	};

	self.unbind = function unbind(type, callback) {
		if(!this.listeners)
			return this;
		
		if(!callback) {
			this.listeners[type] = [];
			return this;
		}
		
		var listeners = this.listeners[type];
		for(var i in listeners) {
			if(listeners[i].callback === callback) {
				listeners.splice(i, 1);
				return unbind.call(this, type, callback);
			}
		}
		
		return this;
	};
	
	self.unbindAll = function unbindAll() {
		this.listeners = [];
		return this;
	};

	self.fire = function fire(event, data) {
		if(!this.listeners)
			return;

		event = self.buildEvent.call(this, event, data);

		var listeners = this.listeners[event.type];
		for(var i in listeners) {
			var listener = listeners[i];
			var scope = listener.scope || this;
			listener.callback.call(scope, event, listener.params, event.data);
		}
		
		deleteBindOneListeners(listeners);
		return this;
	};
	
	function deleteBindOneListeners(listeners) {
		for(var i in listeners) {
			if(listeners[i].bindOne) {
				listeners.splice(i, 1);
				return deleteBindOneListeners(listeners);
			}
		}
	}

	self.buildEvent = function buildEvent(event, data) {
		if(!helper.isObject(event))
			event = { type: event, data: data };

		if(!event.type)
			throw new Error("Type of event is required : " + event);

		event.target = event.target || this;
		event.timeStamp = event.timeStamp || new Date().getTime();
    
	  return event;
	};

	self.buildFireCallBack = function buildFireCallBack(source, event, callback, data) {
		return function () {
			source.fire(event, data);
			if(helper.isFunction(callback))
				callback.call(source);
		};
	};
	
	self.addFunctions = function(scope) {
		scope.bind = self.bind;
		scope.bindOne = self.bindOne;
		scope.unbind = self.unbind;
		scope.unbindAll = self.unbindAll;
		scope.fire = self.fire;
	};
	
	self.addAllFunctions = function(scope) {
		self.addFunctions(scope);
		scope.bindGlobal = self.bindGlobal;
		scope.bindOneGlobal = self.bindOneGlobal;
		scope.unbindGlobal = self.unbindGlobal;
		scope.unbindAllGlobal = self.unbindAllGlobal;
		scope.fireGlobal = self.fireGlobal;
	};
	
	self.addFunctions(globalEvent);
	
	self.bindGlobal = globalEvent.bind.bind(globalEvent);
	self.bindOneGlobal = globalEvent.bindOne.bind(globalEvent);
	self.unbindGlobal = globalEvent.unbind.bind(globalEvent);
	self.unbindAllGlobal = globalEvent.unbindAll.bind(globalEvent);
	self.fireGlobal = globalEvent.fire.bind(globalEvent);
	
	self.buildGlobalFireCallBack = function buildGlobalFireCallBack(event, callback, data) {
		return buildFireCallBack(globalEvent, event, callback, data);
	};

	return self;
});