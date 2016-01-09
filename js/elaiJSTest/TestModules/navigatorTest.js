define(["elaiJS/configuration", "elaiJS/navigator", "elaiJS/helper"],
          function(config, navigator, helper) {
	'use strict';
  var self = {};

  self.getInitPageInfo = function() {
    var pageInfo = navigator.getCurrentPageInfo();
    this.assertEq("overview", pageInfo.page);
    this.done();
  };
  
  self.goToBind = function(test) {
    navigator.bind(navigator.EVENT.pageChanged, function() {
      navigator.unbind(navigator.EVENT.pageChanged);
      test.done();
    });
    
    navigator.goTo({page: "page1", param1: "love"});
  };

  self.goToSimple = function(test) {
    navigator.bind(navigator.EVENT.pageChanged, function() {
      test.assertEq("#page2/param1=love", location.hash);
      navigator.unbind(navigator.EVENT.pageChanged);
      test.done();
    });
    
    navigator.goTo({page: "page2", param1: "love"});
  };
  
  self.goToParam = function(test) {
    navigator.bind(navigator.EVENT.pageChanged, function() {
      test.assertEq("#page2/param1=hope", location.hash);
      navigator.unbind(navigator.EVENT.pageChanged);
      test.done();
    });
    
    navigator.goTo({page: "page2", param1: "hope"});
  };
  
  self.goToParams = function(test) {
    navigator.bind(navigator.EVENT.pageChanged, function() {
      test.assertEq("#page2/param2=hope", location.hash);
      navigator.unbind(navigator.EVENT.pageChanged);
      test.done();
    });
    
    navigator.goTo({page: "page2", param2: "hope"});
  };
  
  self.back = function(test) {
    navigator.bind(navigator.EVENT.pageChanged, function() {
      test.assertEq("#page2/param1=hope", location.hash);
      navigator.unbind(navigator.EVENT.pageChanged);
      test.done();
    });
    
    navigator.back();
  };
  
  self.forward = function(test) {
    navigator.bind(navigator.EVENT.pageChanged, function() {
      test.assertEq("#page2/param2=hope", location.hash);
      navigator.unbind(navigator.EVENT.pageChanged);
      test.done();
    });
    
    navigator.forward();
  };
  
  self.backAndForward = function(test) {
    back(3, function() {
      navigator.bind(navigator.EVENT.pageChanged, function() {
        var pageInfo = navigator.getCurrentPageInfo();
        test.assertEq("overview", pageInfo.page);
        navigator.unbind(navigator.EVENT.pageChanged);
        
        navigator.bind(navigator.EVENT.pageChanged, function() {
          test.assertEq("#page1/param1=love", location.hash);
          navigator.unbind(navigator.EVENT.pageChanged);
          test.done();
        });
        
        navigator.forward();
      });
      
      navigator.back();
    });
  };
  
  function back(count, callback) {
    if(count === 0) {
      callback();
      return;
    }
    
    navigator.bind(navigator.EVENT.pageChanged, function() {
      navigator.unbind(navigator.EVENT.pageChanged);
      back(count - 1, callback);
    });
    
    navigator.back();
  }
  
  self.saveHistoryState = function() {
    navigator.saveHistoryState({love: 42});
    this.assertTrue(helper.equals(navigator.getHistoryState(), {love: 42}));
    
    this.done();
  };
  
  self.addToHistoryState = function() {
    navigator.addToHistoryState({hope: "happy"});
    this.assertTrue(helper.equals(navigator.getHistoryState(), {hope: "happy", love: 42}));
    
    this.assertEq(42, navigator.getHistoryState().love);
    navigator.addToHistoryState({love: "sun"});
    this.assertEq("sun", navigator.getHistoryState().love);
    this.assertEq("happy", navigator.getHistoryState().hope);
    
    navigator.saveHistoryState({sun: 42});
    this.assertUndefined(navigator.getHistoryState().love);
    this.assertUndefined(navigator.getHistoryState().hope);
    this.assertEq(42, navigator.getHistoryState().sun);
    
    this.done();
  };
  
  self.simpleAddCookie = function() {
    navigator.removeAllCookies();
    navigator.addCookie("love", 42);
    
    this.assertEq("42", navigator.getCookie("love"));
    
    this.done();
  };
  
  self.addCookie = function() {
    navigator.removeAllCookies();
    navigator.addCookie({name: "sun", value: 42});
    
    this.assertEq("42", navigator.getCookie("sun"));
    
    this.done();
  };
  
  self.addCookieWithExpirationDays = function() {
    navigator.removeAllCookies();
    navigator.addCookie({name: "sun", value: 42, days: 12});
    
    this.assertEq("42", navigator.getCookie("sun"));
    
    this.done();
  };
  
  self.addCookieWithExpirationDate = function() {
    navigator.removeAllCookies();
    var date = new Date();
    date.setTime(date.getTime() + (182*24*60*60*1000));
    
    navigator.addCookie({name: "sun", value: 42, expires: date});
    
    var cookie = navigator.getCookie("sun");
    this.assertEq("42", navigator.getCookie("sun"));
    
    this.done();
  };
  
  self.addCookieWithPath = function() {
    navigator.removeAllCookies();
    navigator.addCookie({name: "sun", value: 42, path: "/test"});

    this.assertUndefined(navigator.getCookie("sun"));    
    
    this.done();
  };
  
  self.addCookies = function() {
    navigator.removeAllCookies();
    navigator.addCookie({name: "sun", value: "cute"});
    navigator.addCookie({name: "happy", value: "hope"});
    navigator.addCookie({name: "love", value: "42"});

    this.assertEq("cute", navigator.getCookie("sun"));
    this.assertEq("hope", navigator.getCookie("happy"));
    this.assertEq("42", navigator.getCookie("hope"));
    
    this.done();
  };
  
  self.addCookies = function() {
    var cookies = navigator.getCookies();
    this.assertEq(3, Object.keys(cookies).length);
    
    this.assertEq("cute", cookies.sun);
    this.assertEq("hope", cookies.happy);
    this.assertEq("42", cookies.love);
    
    this.done();
  };
  
  self.addCookies = function() {
    navigator.removeAllCookies();
    var cookies = navigator.getCookies();
    this.assertEq(0, Object.keys(cookies).length);
    
    this.assertUndefined(cookies.sun);
    this.assertUndefined(cookies.happy);
    this.assertUndefined(cookies.love);
    
    this.done();
  };
  
  self.overrideCookie = function() {
    navigator.removeAllCookies();
    
    navigator.addCookie({name: "sun", value: "cute"});
    this.assertEq("cute", navigator.getCookie("sun"));
    
    navigator.addCookie({name: "sun", value: "happy"});
    this.assertEq("happy", navigator.getCookie("sun"));
    
    this.done();
  };
  
  self.removeCookie = function() {
    navigator.removeAllCookies();
    
    navigator.addCookie({name: "sun", value: "cute"});
    this.assertEq("cute", navigator.getCookie("sun"));
    
    navigator.removeCookie("sun");
    this.assertUndefined(navigator.getCookie("sun"));
    
    this.done();
  };
  
	return self;
});