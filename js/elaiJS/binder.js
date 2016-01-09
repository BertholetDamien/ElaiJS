define(["elaiJS/helper"], function(helper) {
	'use strict';

	var self = {};
	var globalEvent = {};
	
	self.bindGlobal = function bindGlobal(type, callback, params, scope) {
    self.bind.call(globalEvent, type, callback, params, scope || this);
	};
	
	self.bindOneGlobal = function bindGlobal(type, callback, params, scope) {
    self.bindOne.call(globalEvent, type, callback, params, scope || this);
	};
	
	self.unbindGlobal = function unbindGlobal(type, callback) {
    self.unbind.call(globalEvent, type, callback);
	};
	
	self.fireGlobal = function fireGlobal(event, data) {
    self.fire.call(globalEvent, event, data);
	};
	
	self.buildGlobalFireCallBack = function buildGlobalFireCallBack(event, callback, data) {
    return buildFireCallBack(globalEvent, event, callback, data);
	};
	
	self.bindOne = function bindOne(type, callback, params, scope) {
    self.bind.call(this, type, callback, params, scope, true);
	};

	self.bind = function bind(type, callback, params, scope, bindOne) {
    if(!helper.isFunction(callback))
      throw new Error("callback argument need to be a function.");
    
		this.listeners = this.listeners || {};
		this.listeners[type] = this.listeners[type] || [];
    
    var listener = {  callback: callback, params: params,
                      scope: scope, bindOne: bindOne};
		this.listeners[type].push(listener);
	};

	self.unbind = function unbind(type, callback) {
		if(!this.listeners)
			return;
		
		if(!callback) {
			this.listeners[type] = [];
			return;
		}
		
		var listeners = this.listeners[type];
		for(var i in listeners) {
			if(listeners[i].callback === callback) {
				listeners.splice(i, 1);
				return unbind.call(this, type, callback);
			}
		}
	};
	
	self.unbindAll = function unbindAll() {
    this.listeners = [];
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
	
	self.addBindFunctions = function(scope) {
	  scope.bind = self.bind;
	  scope.bindOne = self.bindOne;
	  scope.unbind = self.unbind;
	  scope.unbindAll = self.unbindAll;
	};
	
	self.addFunctions = function(scope) {
	  self.addBindFunctions(scope);
	  scope.fire = self.fire;
	};
	
	self.addAllFunctions = function(scope) {
	  self.addFunctions(scope);
	  scope.fireGlobal = self.fireGlobal;
	  scope.bindGlobal = self.bindGlobal;
	  scope.unbindGlobal = self.unbindGlobal;
	  scope.bindOneGlobal = self.bindOneGlobal;
	};

	return self;
});