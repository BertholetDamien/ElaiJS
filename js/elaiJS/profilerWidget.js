define(["elaiJS/helper"], function(helper) {
	'use strict';
	
	return function(widget, pluginInfo) {
		var names = ["create", "initialize", "refresh", "refreshData", "fetchData", "setData", "processRowData", "refreshRender", "render", "removeRender", "reload", "destroy", "remove"];

		var plugin = {events: {}};
		for(var i in names) {
			var name = helper.capitalize(names[i]);
			plugin.events["before" + name] = before(name);
			plugin.events["after" + name] = after(name);
		}

		function before(name) {
			return function() {
				console.time(widget.id + " - " + name);
			};
		}

		function after(name) {
			return function() {
				console.timeEnd(widget.id + " - " + name);
			};
		}

		return plugin;
	};
});