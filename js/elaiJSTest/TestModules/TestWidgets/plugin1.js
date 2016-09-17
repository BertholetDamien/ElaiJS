define([  "elaiJS/configuration", "elaiJS/helper", "elaiJS/mode"],
			    function( config, helper, mode) {
	'use strict';
  	
	return function(widget, pluginInfo) {
		widget.hasPlugin1 = true;
		widget.here = [];
		widget.sunPlugin = pluginInfo.sun;
		
		return {
		  events: {
        beforeInitialize: function() {
          this.cute = "love";
        }
		  },
	    initializeBeforeWidget: function() {
        this.kindness = 42;
        widget.here.push("plugin1");
	    }
		};
	};
});