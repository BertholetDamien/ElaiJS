define([  "elaiJS/configuration", "elaiJS/theme", "elaiJS/language",
          "elaiJS/localisation", "elaiJS/mode", "elaiJS/localStorage"],
        function(config, theme, lang, loc, mode, localStorage) {
	'use strict';

	var properties = {};
	properties.builder = function(proto) {
	  
	  proto._create = function(callback) {
	    var _this = this;
      localStorage.bind("theme", function(event) {
        var value = event.data.newValue;
  		  theme.setTheme(value);
  		  selectIndex.call(_this, "themes", value);
      });
      
      callback();
	  };
	  
		proto.beforeRender = function() {
		  clearInterval(this.timeout);
		  this.templateData = new Date();
		};
		
		proto._render = function(callback) {
		  var codeLang = lang.getLanguage();
		  manageSelect.call(this, "languages", codeLang, changeLangLoc);
		  
		  var themeName = theme.getTheme();
		  manageSelect.call(this, "themes", themeName, changeTheme);
		  
		  var modeName = mode.getMode();
		  manageSelect.call(this, "modes", modeName, changeMode);

      var _this = this;		  
		  this.timeout = setInterval(function() {
		    _this.refreshRender();
		  }, 1000);
		  
		  callback();
		};
		
		function manageSelect(className, defaultValue, onChange) {
      var elemSelect = selectIndex.call(this, className, defaultValue);
		  
		  elemSelect.onchange = function() {
		    var elemSelectedOptions = elemSelect.options[elemSelect.selectedIndex];
		    onChange(elemSelectedOptions.value);
		  };
		}
		
		function selectIndex(className, value) {
		  var elemSelect = this.elementDOM.getElementsByClassName(className)[0];
		  
		  value = (!value) ? "undefined" : value;
		  var elemOption = elemSelect.getElementsByClassName(value)[0];
		  if(elemOption)
		    elemOption.setAttribute("selected", undefined);
		  
		  return elemSelect;
		}
		
		function changeLangLoc(newValue) {
		  loc.setLocalisation(newValue);
	    lang.setLanguage(newValue);
		}
		
		function changeTheme(newValue) {
		  theme.setTheme(newValue);
		  localStorage.set("theme", newValue);
		}
		
		function changeMode(newValue) {
		  newValue = (newValue === "") ? undefined : newValue;
		  mode.setMode(newValue);
		}
		
		proto._refreshRender = function _refreshRender(callback) {
		  var elemDate = this.elementDOM.getElementsByClassName("date")[0];
		  elemDate.innerHTML = loc.toLocaleString(new Date());
		  callback();
		};
		
		proto._destroy = function _destroy() {
		  clearInterval(this.timeout);
		};
    
		return proto;
	};

	return properties;
});