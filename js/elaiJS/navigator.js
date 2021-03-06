define(['elaiJS/configuration', 'elaiJS/binder', "elaiJS/promise"],
          function(config, binder, Promise) {
	'use strict';

	var self = {};
	binder.addFunctions(self);

  var EVENT = {
    beforeUnload:           "beforeUnload",
    beforeUnloadInternal:   "beforeUnloadInternal",
    beforeUnloadNavigator:  "beforeUnloadNavigator",
    pageChanged:            "pageChanged",
    reload:                 "reload"
  };
	self.EVENT = EVENT;

	var currentHistoryTime;

  var ignoreHasChange = false;
  var beforeUnloadCallback;
	var beforeUnloadMessage;
	var beforeUnloadShowMessage;
	var currentPageInfo;

	self.initialize = function initialize() {
    window.addEventListener("hashchange",  function() {
		  if(ignoreHasChange)
		    return ignoreHasChange = false;

		  if(beforeUnloadMessage) {
		    fire(EVENT.beforeUnload);
		    fire(EVENT.beforeUnloadInternal);
		    setTimeout(showInternalBeforeUnloadMessage);
		    return;
		  }

		  changeCurrentPage();
		});

		initializeCurrentPage();
	};

	function changeCurrentPage() {
    var oldPageInfo = currentPageInfo;
    initializeCurrentPage();
    fire(EVENT.pageChanged, currentPageInfo, oldPageInfo);
	}

	function fire(type, newPageInfo, oldPageInfo) {
		var event = {
		  type: type,
		  newPageInfo: newPageInfo,
		  oldPageInfo: oldPageInfo
		};

		self.fire(event);
	}

	function initializeCurrentPage() {
    currentPageInfo = buidCurrentPageInfo();

		var history = self.getHistoryState() || {};
    history.elaiJS = history.elaiJS || {};
		if(!history.elaiJS.historyTime) {
			history.elaiJS.historyTime = new Date().getTime();
			self.addToHistoryState(history);
		}

		currentHistoryTime = history.elaiJS.historyTime;
	}

	self.getCurrentPageInfo = function getCurrentPageInfo() {
	  return currentPageInfo;
	};

	self.goTo = function goTo(pageInfo) {
		location.hash = buildHash(pageInfo);
	};

	self.forward = function forward() {
		window.history.forward();
	};

	self.back = function back() {
		window.history.back();
	};

	self.reload = function reload() {
		fire(EVENT.reload, currentPageInfo);
	}

	self.getHistoryState = function getHistoryState() {
    return window.history.state;
	};

	self.saveHistoryState = function saveHistoryState(state) {
    window.history.replaceState(state, "");
	};

	self.addToHistoryState = function addToHistoryState(params) {
    var state = self.getHistoryState();
	  if(!state)
	    state = {};

    for(var key in params)
      state[key] = params[key];

    self.saveHistoryState(state);
	};

	function buildHash(pageInfo) {
    if(!config.elaiJS.buildHash)
      throw new Error("Missing configuration for 'elaiJS.buildHash'.");

    return config.elaiJS.buildHash(pageInfo);
	}

	function buidCurrentPageInfo() {
    if(!config.elaiJS.extractPageInfo)
      throw new Error("Missing configuration for 'elaiJS.extractPageInfo'.");

    var hash = location.hash.substring(1);
    return config.elaiJS.extractPageInfo(hash);
	}

	function showInternalBeforeUnloadMessage() {
	  var message = getBeforeUnloadMessage(true);
    if(!message)
      return changeCurrentPage();

    var action = config.elaiJS.showInternalBeforeUnloadMessage;
    if(beforeUnloadShowMessage)
      action = beforeUnloadShowMessage;

    action(message).then(function() {
      changeCurrentPage();
      self.removeBeforeUnloadMessage();
    }, function() {
      ignoreHasChange = true;
			if(isComesFromBack())
      	self.forward();
			else
				self.back();
    });
  }

	function isComesFromBack() {
		var history = self.getHistoryState() || {};
		var historyTime = history.elaiJS ? history.elaiJS.historyTime : undefined;
		if(!historyTime)
			return false;
		return historyTime < currentHistoryTime;
	}

  self.showInternalBeforeUnloadMessage = function showInternalBeforeUnloadMessage() {
		var message = getBeforeUnloadMessage(true);
		if(!message)
			return Promise.resolve();

		var action = beforeUnloadShowMessage || config.elaiJS.showInternalBeforeUnloadMessage;
		return action(message);
  }

	self.setBeforeUnloadMessage = function setBeforeUnloadMessage(message, callback, showMessage) {
	  beforeUnloadMessage = message;
	  beforeUnloadCallback = callback;
	  beforeUnloadShowMessage = showMessage;

		window.onbeforeunload = function() {
		  fire(EVENT.beforeUnload);
		  fire(EVENT.beforeUnloadNavigator);
		  return getBeforeUnloadMessage(false);
		};
	};

	self.removeBeforeUnloadMessage = function removeBeforeUnloadMessage() {
		window.onbeforeunload = undefined;
		beforeUnloadCallback = undefined;
		beforeUnloadMessage = undefined;
		beforeUnloadShowMessage = undefined;
	};

	function getBeforeUnloadMessage(isInternal) {
    if(beforeUnloadCallback)
      return beforeUnloadCallback(beforeUnloadMessage, isInternal);

    if(config.elaiJS.beforeUnloadCallback)
      return config.elaiJS.beforeUnloadCallback(beforeUnloadMessage, isInternal);

    return beforeUnloadMessage;
	}

	self.addCookie = function(arg1, arg2) {
	  var params = (arg2) ? {name: arg1, value: arg2} : arg1;

	  if(params.remove !== false)
      self.removeCookie(params.name);

    var date = params.expires;
    if(!date && params.days) {
      date = new Date();
      date.setTime(date.getTime() + (params.days*24*60*60*1000));
    }

    var cookieStr = params.name + "=" + params.value + ";";
    if(date)
      cookieStr += "expires=" + date.toUTCString() + ";";
    if(params.path)
      cookieStr += "path=" + params.path + ";";

    document.cookie = cookieStr;
    return self;
	};

	self.getCookie = function(name) {
    return self.getCookies()[name];
	};

	self.removeCookie = function(name) {
	  var date = new Date();
	  date.setTime(date.getTime() - 1);

    return self.addCookie({name: name, value: "", expires: date, remove: false});
	};

	self.getCookies = function() {
	  // It's better for health when it's raw !
    var rawCookies = document.cookie.split(';');
    var cookies = {};
    for(var i in rawCookies) {
      var rawCookie = rawCookies[i].trim();
      if(rawCookie !== "") {
        rawCookie = rawCookie.split("=");
        cookies[rawCookie[0]] = rawCookie[1];
      }
    }

    return cookies;
	};

	self.removeAllCookies = function() {
    for(var name in self.getCookies())
      self.removeCookie(name);
	};

	return self;
});
