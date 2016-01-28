define(["elaiJS/webservice", "elaiJS/multicallback",
        "elaiJS/configuration", "elaiJS/helper"],
            function(webservice, multicallback, config, helper) {
	'use strict';
  var DEFAULT_PRIORITY = 100;

	var self = {};

	self.applyDefaultPlugins = function applyDefaultPlugins(widget, widgetPrototype, callback) {
    var pluginsInfo = getPluginsInfo(widgetPrototype);
    self.applyPlugins(pluginsInfo, widget, callback);
	};
	
	self.applyPlugins = function applyPlugins(pluginsInfo, widget, callback) {
    var countPlugins = Object.keys(pluginsInfo).length;
    if(countPlugins === 0) {
      callback();
      return;
	  }
    
		var multiCallBackFunction = multicallback(countPlugins, callback);
    for(var name in pluginsInfo)
      self.applyPlugin(pluginsInfo[name], widget, multiCallBackFunction);
	};

	self.applyPlugin = function applyPlugin(pluginInfo, widget, callback) {
    if(pluginInfo.mode === undefined)
      pluginInfo.mode = widget.mode;
    if(pluginInfo.priority === undefined)
      pluginInfo.priority = DEFAULT_PRIORITY;

    createPlugin(pluginInfo, widget, function(plugin) {
      addPlugin(plugin, pluginInfo, widget);
      if(callback)
        callback();
	  });
	};

	function getPluginsInfo(widgetPrototype) {
    var parentPlugins = getParentPlugin(widgetPrototype);

    var pluginsInfo = widgetPrototype.properties.plugins || {};
    pluginsInfo = helper.clone(pluginsInfo);
    mergePlugins(pluginsInfo, parentPlugins);
    
    if(widgetPrototype.properties.inheritDefaultPlugins)
      removeDefaultPlugins(pluginsInfo);

    cleanPlugins(pluginsInfo);

    return pluginsInfo;
  }

  function cleanPlugins(pluginsInfo) {
    for(var name in pluginsInfo) {
      var pluginInfo = pluginsInfo[name];
      pluginInfo.name = name;
      if(pluginInfo.inherit === true)
        delete pluginsInfo[name];
    }
  }

  function mergePlugins(pluginsInfo, parentPlugins) {
    for(var name in parentPlugins) {
      if(pluginsInfo[name])
          pluginsInfo[name] = mergePluginInfos(pluginsInfo[name], parentPlugins[name]);
      else
        pluginsInfo[name] = parentPlugins[name];
	  }
  }

  function mergePluginInfos(pluginInfo, pluginInfoParent) {
    if(pluginInfo.inheritParams === true)
      return pluginInfo;

    for(var key in pluginInfoParent) {
      if(pluginInfo[key] === undefined)
        pluginInfo[key] = pluginInfoParent[key];
    }

    return pluginInfo;
	}

	function getParentPlugin(widgetPrototype) {
	  if(!widgetPrototype.parent)
	    return getDefaultPlugins();

	   return getPluginsInfo(widgetPrototype.parent);
	}

	function getDefaultPlugins() {
	  return config.defaultPlugins || {};
	}

	function removeDefaultPlugins(pluginsInfo) {
	  var defaultPlugins = getDefaultPlugins();
	  for(var name in defaultPlugins)
      delete pluginsInfo[name];
	}

	function addPlugin(plugin, pluginInfo, widget) {
    var name = pluginInfo.name;
    var mode = pluginInfo.mode;

    if(!widget.plugins)
      widget.plugins = [];
    
    widget.plugins.push({info: pluginInfo, plugin: plugin});
    widget.plugins = sortPlugins(widget.plugins);
    
    bindPluginEvent(plugin, widget);
	}
	
	function sortPlugins(plugins) {
	  return plugins.sort(function(a, b) {
	    var prioA = a.info.priority;
	    var prioB = b.info.priority;
	    if(prioA === prioB)
  	    return 0;
	    if(prioA < prioB)
  	    return -1;
	    return 1;
	  });
	}
	
	function bindPluginEvent(plugin, widget) {
	  for(var key in plugin.events) {
      if(helper.isFunction(plugin.events[key]))
        widget.bind(key, plugin.events[key], undefined, widget);
    }
	}

	function createPlugin(pluginInfo, widget, callback) {
	  getPrototypeOf(pluginInfo, function(pluginPrototype) {
      var plugin = pluginPrototype(widget, pluginInfo) || {};
      callback(plugin);
	  });
	}

	function getPrototypeOf(pluginInfo, callback) {
    webservice.loadPlugin(pluginInfo, callback);
	}

	return self;
});