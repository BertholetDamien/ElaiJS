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
	function loadWidget(params, resolve, reject) {
    var url = params.name;
    if(params.name.indexOf("/") === -1)
      url = mode.getRessource("widget", params);
    
    webservice.loadJSFile(url).then(resolve, reject);
	}

	function loadPlugin(params, resolve, reject) {
    var url = params.name;
    if(params.url)
      url = params.url;
    else if(params.name.indexOf("/") === -1)
      url = mode.getRessource("plugin", params);
	  
		webservice.loadJSFile(url).then(resolve, reject);
	}
	
	function loadWidgetCSS(params, resolve, reject) {
    var cssSettings = getCSSSettings(params);
    
		for(var i in cssSettings) {
			var setting = cssSettings[i];
			webservice.loadCSS({url: setting.url}).then(resolve, reject);
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
	function loadLocalisationFile(name, resolve, reject) {
    var url = res.get("localisation", {name: name});
    webservice.loadJSONFile(url).then(resolve, reject);
	}
	
	function loadLanguageFile(name, resolve, reject) {
    var url = res.get("language", {name: name});
    webservice.loadPropertiesFile(url).then(resolve, reject);
	}
	
	function loadTemplate(params, resolve, reject) {
    var url = mode.getRessource("template", params);
  	webservice.loadTextFile({url: url}).then(resolve, reject);
	}
	
	function loadTheme(params, resolve, reject) {
    var url = res.get("theme", params);
    webservice.loadCSS(url, {useCache: false}).then(resolve, reject);
	}
	
	function removeTheme(params, resolve, reject) {
    var url = res.get("theme", params);
    webservice.removeDocument(url).then(resolve, reject);
	}
	
	/************************************************************************
	 ************************** Generic webservice **************************
	 ************************************************************************/
	function loadCSS(params, resolve, reject) {
    if(!helper.isObject(params))
      params = {url: params};
    params.rel = "stylesheet";
    params.type = "text/css";
    
		webservice.loadDocument(params).then(resolve, reject);
	}
	
	function loadDocument(params, resolve, reject) {
    if(!helper.isObject(params))
      params = {url: params};
		var link = document.createElement("link");
		if(params.type)
		  link.type = params.type;
		link.rel = params.rel || "import";
		link.href = params.url + getVersionURL(params.addVersion, true);
		
		link.addEventListener("load", function(event) {
		  event.src = link;
		  resolve(event);
		});
		
		link.addEventListener("error", function(event) {
		  event.src = link;
		  reject(event);
		});
      
		document.getElementsByTagName("head")[0].appendChild(link);
	}
	
	function removeDocument(params, resolve, reject) {
	  if(!helper.isObject(params))
      params = {url: params};
      
    var href = params.url + getVersionURL(params.addVersion, true);
	  var elems = document.querySelectorAll('link[href="' + href + '"]');
	  for(var i = 0 ; i < elems.length ; ++i)
      elems[i].parentNode.removeChild(elems[i]);
    
    resolve();
	}
	
	function loadJSONFile(params, resolve, reject) {
	  webservice.loadTextFile(params).then(function(text) {
	    resolve(JSON.parse(text));
	  }, reject);
	}
	
	function loadPropertiesFile(params, resolve, reject) {
	  webservice.loadTextFile(params).then(function(text) {
	    resolve(parseProperties(text));
	  }, reject);
	}
	
	function loadJSFile(url, resolve, reject) {
    require([url], resolve, reject);
	}
	
	function loadTextFile(params, resolve, reject) {
	  if(!helper.isObject(params))
	    params = {url: params};
	    
    params.url += getVersionURL(params.addVersion, true);
    
    params.method = "GET";
		callHTTPRequest(params).then(function(response) {
      resolve((response.isSuccess) ? response.responseText : undefined);
    }, reject);
	}
	
	function callHTTPRequest(params) {
		return new Promise(function(resolve, reject) {
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
	      
	      if(req.isError)
	        reject(req);
	      else
	        resolve(req);
	    };
	
	    var data = (params.data) ? JSON.stringify(params.data) : null;
	    req.send(data);
		});
	}
	
	function callAjaxHTTPRequest(params, resolve, reject) {
	  if(!helper.isObject(params))
      params = {url: params};
    
	  params.method = params.method || "POST";
    params.requestHeader = params.requestHeader || {};
    if(!params.requestHeader["Content-Type"])
      params.requestHeader["Content-Type"] = "application/json;charset=UTF-8";
    
    callHTTPRequest(params).then(resolve, reject);
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