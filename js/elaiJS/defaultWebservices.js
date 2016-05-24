define([  "elaiJS/webservice", "elaiJS/ressources", "elaiJS/helper",
          "elaiJS/configuration", "elaiJS/mode"],
            function(webservice, res, helper, config, mode) {
	'use strict';

  var self = {};
	
	self.addDefaultWebservices = function addDefaultWebservices() {
    webservice.addService("call", callHTTPRequest);
    webservice.addService("ajax", callAjaxHTTPRequest);
    webservice.addService("loadTextFile", loadTextFile);
    webservice.addService("loadDocument", loadDocument);
    webservice.addService("removeDocument", removeDocument);
    webservice.addService("loadCSS", loadCSS, {useCache: true});
    webservice.addService("loadJSONFile", loadJSONFile);
    webservice.addService("loadPropertiesFile", loadPropertiesFile);
    webservice.addService("loadJSFile", loadJSFile);
    
    webservice.addService("loadTheme", loadTheme);
    webservice.addService("removeTheme", removeTheme);
    webservice.addService("loadLanguage", loadLanguageFile, {useCache: true});
    webservice.addService("loadLocalisation", loadLocalisationFile, {useCache: true});
    webservice.addService("loadTemplate", loadTemplate, {useCache: true});
    webservice.addService("loadWidget", loadWidget);
    webservice.addService("loadPlugin", loadPlugin);
    webservice.addService("loadWidgetCSS", loadWidgetCSS);
	};
	
	/************************************************************************
	 ************************* Widget/Plugins stuff **************************
	 ************************************************************************/
	function loadWidget(params, callback, errCallback) {
    var url = params.name;
    if(params.name.indexOf("/") === -1)
      url = mode.getRessource("widget", params);
    
    webservice.loadJSFile(url, callback, errCallback);
	}

	function loadPlugin(params, callback, errCallback) {
    var url = params.name;
    if(params.url)
      url = params.url;
    else if(params.name.indexOf("/") === -1)
      url = mode.getRessource("plugin", params);
	  
		webservice.loadJSFile(url, callback, errCallback);
	}
	
	function loadWidgetCSS(params, callback, errCallback) {
    var cssSettings = getCSSSettings(params);
    
		for(var i in cssSettings) {
			var setting = cssSettings[i];
			webservice.loadCSS({url: setting.url}, callback, errCallback);
		}
	}
	
	function getCSSSettings(params) {
	  var cssSettings = params.css;
		if(cssSettings === true)
			cssSettings = [{name: params.name, mode: params.defaultMode}];
    
		for(var i in cssSettings) {
			var setting = cssSettings[i];
			setting.mode = (setting.mode === null) ? undefined : setting.mode || params.defaultMode;
			var url = mode.getRessource("widget", setting, "widgetCSS", "widgetCSSMode");
			setting.url = url;
		}
		
		return cssSettings;
	}
	
	/************************************************************************
	 ************************** Ressources Files ****************************
	 ************************************************************************/
	function loadLocalisationFile(name, callback, errCallback) {
    var url = res.get("localisation", {name: name});
    webservice.loadJSONFile(url, callback, errCallback);
	}
	
	function loadLanguageFile(name, callback, errCallback) {
    var url = res.get("language", {name: name});
    webservice.loadPropertiesFile(url, callback, errCallback);
	}
	
	function loadTemplate(params, callback, errCallback) {
    var url = mode.getRessource("template", params);
  	webservice.loadTextFile({url: url}, callback, errCallback);
	}
	
	function loadTheme(params, callback, errCallback) {
    var url = res.get("theme", params);
    webservice.loadCSS(url, callback, errCallback, {useCache: false});
	}
	
	function removeTheme(params, callback, errCallback) {
    var url = res.get("theme", params);
    webservice.removeDocument(url, callback, errCallback);
	}
	
	/************************************************************************
	 ************************** Generic webservice **************************
	 ************************************************************************/
	function loadCSS(params, callback, errCallback) {
    if(!helper.isObject(params))
      params = {url: params};
    params.rel = "stylesheet";
    params.type = "text/css";
    
		webservice.loadDocument(params, callback, errCallback);
	}
	
	function loadDocument(params, callback, errCallback) {
    if(!helper.isObject(params))
      params = {url: params};
		var link = document.createElement("link");
		if(params.type)
		  link.type = params.type;
		link.rel = params.rel || "import";
		link.href = params.url + getVersionURL(params.addVersion, true);
		
		link.addEventListener("load", function(event) {
		  event.src = link;
  		if(helper.isFunction(params.onSuccess))
        params.onSuccess(event);

		  callback(event);
		});
		
		link.addEventListener("error", function(event) {
		  event.src = link;
  		if(helper.isFunction(params.onError))
        params.onError(event);
      
		  errCallback(event);
		});
      
		document.getElementsByTagName("head")[0].appendChild(link);
	}
	
	function removeDocument(params, callback, errCallback) {
	  if(!helper.isObject(params))
      params = {url: params};
      
    var href = params.url + getVersionURL(params.addVersion, true);
	  var elems = document.querySelectorAll('link[href="' + href + '"]');
	  for(var i = 0 ; i < elems.length ; ++i)
      elems[i].parentNode.removeChild(elems[i]);
    
    callback();
	}
	
	function loadJSONFile(params, callback, errCallback) {
	  webservice.loadTextFile(params, function(text) {
	    callback(JSON.parse(text));
	  }, errCallback);
	}
	
	function loadPropertiesFile(params, callback, errCallback) {
	  webservice.loadTextFile(params, function(text) {
	    callback(parseProperties(text));
	  }, errCallback);
	}
	
	function loadJSFile(url, callback, errCallback) {
    require([url], callback, errCallback);
	}
	
	function loadTextFile(params, callback, errCallback) {
	  if(!helper.isObject(params))
	    params = {url: params};
	    
    params.url += getVersionURL(params.addVersion, true);
    
    params.method = "GET";
    callHTTPRequest(params, function(response) {
      callback((response.isSuccess) ? response.responseText : undefined);
    }, errCallback);
	}
	
	function callHTTPRequest(params, callback, errCallback) {
	  if(!helper.isObject(params))
      params = {url: params};
    
    var url = params.url;
		var req = getXMLHttpRequest();
		var async = (params.async === false) ? false : true;
		var method = (params.method) ? params.method.toUpperCase() : "GET";
    req.open(method, url, async);
    
    for(var key in params.requestHeader)
      req.setRequestHeader(key, params.requestHeader[key]);
      
    req.onreadystatechange = function() {
      if(req.readyState != 4)
        return;
      
      req.isSuccess = req.status === 200;
      req.isError = !req.isSuccess;
      req.responseJSON = helper.parseJSON(req.responseText);
      
      if(req.isSuccess && helper.isFunction(params.onSuccess))
        params.onSuccess(req);
      else if(req.isError && helper.isFunction(params.onError))
        params.onError(req);
        
      if(req.isError)
        errCallback();
      else
        callback(req);
    };

    var data = (params.data) ? JSON.stringify(params.data) : null;
    req.send(data);
	}
	
	function callAjaxHTTPRequest(params, callback, errCallback) {
	  if(!helper.isObject(params))
      params = {url: params};
    
	  params.method = params.method || "POST";
    params.requestHeader = params.requestHeader || {};
    if(!params.requestHeader["Content-Type"])
      params.requestHeader["Content-Type"] = "application/json;charset=UTF-8";
    
    callHTTPRequest(params, callback, errCallback);
	}

	function getXMLHttpRequest() {
    if(window.XMLHttpRequest)
			return new XMLHttpRequest();

		if(window.ActiveXObject) {
			try {
				return new ActiveXObject("Msxml2.XMLHTTP");
			} catch(e) {
				return new ActiveXObject("Microsoft.XMLHTTP");
			}
		}
    
    throw new Error("Your browser doesn't support XMLHTTPRequest.");
  }
  
  function parseProperties(rawText) {
    var properties = {};
	  
	  var lastKey;
    var lines = rawText.split(/\r?\n/);
    for(var i in lines) {
      var line = lines[i];
      if(lastKey) {
        var storeKey = lastKey;
        line = checkMultiLine(line);
        properties[storeKey] += "\n" + line;
        continue;
      }
      
      var index = line.indexOf("=");
      if(index === -1)
        continue;
      
      var key = line.substr(0, index);
      var value = line.substr(index + 1);
      
      value = checkMultiLine(value);
      properties[key] = value;
    }
    
    function checkMultiLine(value) {
      if(value.charAt(value.length -1) === "\\") {
        lastKey = key;
        value = value.substring(0, value.length - 1);
      }
      else {
        lastKey = undefined;
      }
      
      return value;
    }
    
    return properties;
	}
	
	function getVersionURL(needVersion, needVersionDefault) {
    if(!config.elaiJS.version)
      return "";
	  
    if(needVersion === undefined)
      needVersion = (needVersionDefault === undefined) ? true : needVersionDefault;
    
    return needVersion ? "?v=" + config.elaiJS.version : "";
	}
	
	return self;
});