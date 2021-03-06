define([  "elaiJS/configuration", "elaiJS/helper",
          "elaiJS/ressources", "elaiJS/binder"],
          function(config, helper, ressources, binder) {
	'use strict';

  var mode = null;
	var self = {};
	binder.addFunctions(self);
	var EVENT = {modeChanged: "modeChanged"};
	self.EVENT = EVENT;
	
	self.getMode = function getMode() {
	  return mode === null ? config.elaiJS.defaultMode : mode;
	};
	
	self.setMode = function setMode(newMode) {
	  if(newMode === mode)
	    return;
    
	  var params = {oldMode: mode, newMode: newMode};
	  mode = newMode;
	  self.fire(EVENT.modeChanged, params);
	};
	
	self.getRessource = function (type, params, ressourceNoMode, ressourceWithMode) {
    if(!helper.isObject(params))
      params = {name: params};
    
    if(!ressourceNoMode)
      ressourceNoMode = type;
    
    if(!ressourceWithMode)
      ressourceWithMode = ressourceNoMode + "Mode";
    
    params.mode = self.findMode(type, params);
    var ressource = (params.mode) ? ressourceWithMode : ressourceNoMode;
    return ressources.get(ressource, params);
	};

	self.findMode = function findMode(type, params) {
		if( !params.mode
		    || !config.elaiJS.modesRessources
		    || !config.elaiJS.modesRessources[type]
		    || !config.elaiJS.modesRessources[type][params.name])
		  return undefined;
		
		var acceptModes = config.elaiJS.modesRessources[type][params.name];
		return findBestMode(params.mode, acceptModes);
	};
	
	function findBestMode(wishMode, acceptModes){
    for(var i in acceptModes) {
      if(acceptModes[i].toLowerCase() === wishMode.toLowerCase())
        return wishMode;
    }
    
    if(config.elaiJS.modes && config.elaiJS.modes[wishMode])
      return findBestMode(config.elaiJS.modes[wishMode], acceptModes);
    
    return undefined;
	}
	
	return self;
});