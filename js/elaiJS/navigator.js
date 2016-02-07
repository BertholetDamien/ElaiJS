define(['elaiJS/configuration', 'elaiJS/binder'],
          function(config, binder) {
	'use strict';
  
	var self = {};
	binder.addFunctions(self);
	
  var EVENT = { beforeUnload: "beforeUnload",
	              beforeUnloadConfirm: "beforeUnloadConfirm",
	              beforeUnloadNavigator: "beforeUnloadNavigator",
                pageChanged: "pageChanged"
  };
	self.EVENT = EVENT;

  var ignoreHasChange = false;
  var beforeUnloadCallback;
	var beforeUnloadMessage;
	var currentPageInfo;
  
	function initialize() {
		window.onhashchange = function() {
		  if(ignoreHasChange)
		    return ignoreHasChange = false;
		  
		  if(beforeUnloadMessage) {
		    fire(EVENT.beforeUnload);
		    fire(EVENT.beforeUnloadConfirm);
		    showConfirmMessage();
		    return;
		  }

		  changeCurrentPage();
		};
	}
	
	function changeCurrentPage() {
    var oldPageInfo = currentPageInfo;
    self.initializeCurrentPage();
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
	
	self.initializeCurrentPage = function initializeCurrentPage() {
    currentPageInfo = buidCurrentPageInfo();
	};

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
	
	self.getHistoryState = function getHistoryState(state) {
    return window.history.state;
	};
	
	self.saveHistoryState = function saveHistoryState(state) {
    window.history.pushState(state, "");
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
    if(!config.buildHash)
      throw new Error("You need to configure 'buildHash'.");

    return config.buildHash(pageInfo);
	}

	function buidCurrentPageInfo() {
    var hash = location.hash.substring(1);
    if(!config.extractPageInfo)
      throw new Error("You need to configure 'extractPageInfo'.");

    return config.extractPageInfo(hash);
	}
	
	function showConfirmMessage() {
	  var message = getBeforeUnloadMessage(true);
    
	  var choice = true;
	  if(message) {
	    choice = confirm(message);
    }
    
    if(choice) {
      changeCurrentPage();
    } else {
      ignoreHasChange = true;
      self.back();
    }
	}

	self.setBeforeUnloadMessage = function setBeforeUnloadMessage(message, callback) {
	  beforeUnloadCallback = callback;
	  beforeUnloadMessage = message;
	  
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
	};
	
	function getBeforeUnloadMessage(isConfirm) {
    if(beforeUnloadCallback)
      return beforeUnloadCallback(beforeUnloadMessage, isConfirm);
    
    if(config.beforeUnloadCallback)
      return config.beforeUnloadCallback(beforeUnloadMessage, isConfirm);
    
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
    
    var cookieStr = params.name + "=" + params.value + "; ";
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
    for(var name in self.getCookies()) {
      self.removeCookie(name);
    }
	};
	
	function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
  }
  
  function getCookie(cname) {
      var name = cname + "=";
      var ca = document.cookie.split(';');
      for(var i=0; i<ca.length; i++) {
          var c = ca[i];
          while (c.charAt(0)==' ') c = c.substring(1);
          if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
      }
      return "";
  }

	initialize();
	return self;
});