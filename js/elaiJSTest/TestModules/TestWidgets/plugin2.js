define([  "elaiJS/configuration", "elaiJS/helper", "elaiJS/mode"],
			    function( config, helper, mode) {
	'use strict';
  	
	return function(widget, pluginInfo) {
		widget.hasPlugin2 = true;
		widget.here = [];
		
		return {
		  events: {
        beforeInitialize: function() {
          this.cute = "love";
        }
		  },
	    initializeBeforeWidget: function(callback) {
        widget.here.push("plugin2");
        callback();
	    }
		};
	};
});