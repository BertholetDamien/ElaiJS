define(["elaiJS/webservice", "elaiJS/configuration", "elaiJS/helper", "elaiJS/promise"],
				function(webservice, config, helper, Promise) {
	'use strict';
	var self = {};

	self.applyDefaultPlugins = function applyDefaultPlugins(widget, widgetPrototype) {
    var pluginsInfo = getPluginsInfo(widgetPrototype);
    return self.applyPlugins(pluginsInfo, widget);
	};
	
	self.applyPlugins = function applyPlugins(pluginsInfo, widget) {
		var promises = [];
    for(var name in pluginsInfo)
      promises.push(self.applyPlugin(pluginsInfo[name], widget));
    return Promise.all(promises);
	};

	self.applyPlugin = function applyPlugin(pluginInfo, widget) {
    if(pluginInfo.mode === undefined)
      pluginInfo.mode = widget.mode;
    if(pluginInfo.priority === undefined)
      pluginInfo.priority = config.elaiJS.defaultPluginPriority;

    return createPlugin(pluginInfo, widget).then(function(plugin) {
      return addPlugin(plugin, pluginInfo, widget);
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
	  return config.elaiJS.defaultPlugins || {};
	}

	function removeDefaultPlugins(pluginsInfo) {
	  var defaultPlugins = getDefaultPlugins();
	  for(var name in defaultPlugins)
      delete pluginsInfo[name];
	}

	function addPlugin(plugin, pluginInfo, widget) {
    if(!widget.plugins)
      widget.plugins = [];
    
    widget.plugins.push({info: pluginInfo, plugin: plugin});
    widget.plugins = sortPlugins(widget.plugins);
    
    bindPluginEvent(plugin, widget);
    return plugin;
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

	function createPlugin(pluginInfo, widget) {
	  return webservice.loadPlugin(pluginInfo).then(function(pluginPrototype) {
      return pluginPrototype(widget, pluginInfo) || {};
	  });
	}

	return self;
});