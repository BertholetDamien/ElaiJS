define(["elaiJS/configuration"], function(config) {
	'use strict';
  var self = {};
	
	self.get = function get(name, params, ressourcesList) {
    ressourcesList = ressourcesList || config.ressources;
    
    var value = ressourcesList[name];
    if(!value)
      return undefined;
    
    return replaceHolder(value, params, ressourcesList);
	};
	
	self.execute = function execute(value, params, ressourcesList) {
    ressourcesList = ressourcesList || config.ressources;
    return replaceHolder(value, params, ressourcesList);
	};
	
	function replaceHolder(value, params, ressourcesList) {
    var matchFind = value.match("\\{\\{[a-zA-Z0-9]*\\}\\}");
    if(!matchFind)
      return value;
    matchFind = matchFind[0];
    
    var matchValue = getMatchValue(matchFind, params, ressourcesList);
    value = value.replace(matchFind, matchValue);
    return replaceHolder(value, params, ressourcesList);
	}
	
	function getMatchValue(matchFind, params, ressourcesList) {
	  var matchName = matchFind.substring(2, matchFind.length - 2);
	  if(params && params[matchName])
	    return params[matchName];
	   
    var matchValue = self.get(matchName, params, ressourcesList);
    if(matchValue === undefined)
      return "[notfound]";
    
    return matchValue;
	}
	
	return self;
});