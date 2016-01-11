define([  "elaiJS/webservice", "elaiJS/ressources", "elaiJS/helper",
          "elaiJS/configuration", "elaiJS/mode"],
            function(webservice, res, helper, config, mode) {
	'use strict';

  var self = {};
	
	self.addDefaultWebservices = function addDefaultWebservices() {
    webservice.addService("call", callHTTPRequest);
    webservice.addService("ajax", callAjaxHTTPRequest);
    webservice.addService("loadTextFile", loadTextFile);
    webservice.addService("loadCSS", loadCSS, true);
    webservice.addService("loadJSONFile", loadJSONFile);
    webservice.addService("loadPropertiesFile", loadPropertiesFile);
    webservice.addService("loadJSFile", loadJSFile);
    
    webservice.addService("loadLanguageFile", loadLanguageFile);
    webservice.addService("loadLocalisationFile", loadLocalisationFile);
    webservice.addService("loadTemplate", loadTemplate, true);
    webservice.addService("loadWidget", loadWidget);
    webservice.addService("loadPlugin", loadPlugin);
    webservice.addService("loadWidgetCSS", loadWidgetCSS);
	};
	
	/************************************************************************
	 ************************* Widget/Plugins stuff **************************
	 ************************************************************************/
	function loadWidget(params, callback) {
    var url = params.name;
    if(params.name.indexOf("/") === -1)
      url = mode.getRessource("widget", params);
    else
      params.addVersion = false;
    
    webservice.loadJSFile({url: url, addVersion: params.addVersion}, callback);
	}

	function loadPlugin(params, callback) {
	  var url = params.name;
	  if(params.url)
	    url = params.url;
    else if(params.name.indexOf("/") === -1)
      url = mode.getRessource("plugin", params);
    else
      params.addVersion = false;
	  
		webservice.loadJSFile({url: url, addVersion: params.addVersion}, callback);
	}
	
	function loadWidgetCSS(params) {
	  var cssSettings = getCSSSettings(params);
    
		for(var i in cssSettings) {
			var setting = cssSettings[i];
			webservice.loadCSS({url: setting.url, addVersion: true});
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
	function loadLocalisationFile(name, callback) {
    var url = res.get("localisation", {name: name}) + getVersionURL();
    webservice.loadJSONFile(url, callback);
	}
	
	function loadLanguageFile(name, callback) {
    var url = res.get("language", {name: name}) + getVersionURL();
    webservice.loadPropertiesFile(url, callback);
	}
	
	function loadTemplate(params, callback) {
	  var url = mode.getRessource("template", params);
  	webservice.loadTextFile({url: url, addVersion: true}, callback);
	}
	
	/************************************************************************
	 ************************** Generic webservice **************************
	 ************************************************************************/
	function loadCSS(params, callback) {
    if(!helper.isObject(params))
      params = {url: params};
		var link = document.createElement("link");
		link.type = "text/css";
		link.rel = "stylesheet";
		link.href = params.url + ((params.addVersion) ? getVersionURL() : "");
		
		document.getElementsByTagName("head")[0].appendChild(link);
		callback(link);
	}
	
	function loadJSONFile(params, callback) {
	  webservice.loadTextFile(params, function(text) {
	    callback(JSON.parse(text));
	  });
	}
	
	function loadPropertiesFile(params, callback) {
	  webservice.loadTextFile(params, function(text) {
	    callback(parseProperties(text));
	  });
	}
	
	function loadJSFile(params, callback) {
	  var requireParams = {};
    var url = params.url;
    if(params.addVersion !== false)
      requireParams.getParams = getVersionURL();
    
    require([url], callback, requireParams);
	}
	
	function loadTextFile(params, callback) {
	  if(!helper.isObject(params))
	    params = {url: params};
	 
    params.method = "GET";
    callHTTPRequest(params, function(response) {
      callback((response.isSuccess) ? response.responseText : undefined);
    });
	}
	
	function callHTTPRequest(params, callback) {
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

      callback(req);
    };

    var data = (params.data) ? JSON.stringify(params.data) : null;
    req.send(data);
	}
	
	function callAjaxHTTPRequest(params, callback) {
	  params.method = params.method || "POST";
    params.requestHeader = params.requestHeader || {};
    if(!params.requestHeader["Content-Type"])
      params.requestHeader["Content-Type"] = "application/json;charset=UTF-8";
    
    callHTTPRequest(params, callback);
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
	  
    var lines = rawText.split(/\r?\n/);
    for(var i in lines) {
      var line = lines[i];
      var index = line.indexOf("=");
      var key = line.substr(0, index);
      var value = line.substr(index + 1);
      
      properties[key] = value;
    }
    
    return properties;
	}
	
	function getVersionURL() {
	  if(!config.version)
	    return "";
    
	  return "?v=" + config.version;
	}
	
	return self;
});