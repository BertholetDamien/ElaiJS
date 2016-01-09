define([], function() {
	'use strict';
	
  return function(fcts, initialParams, callback, scope) {
    scope = scope || this;
    var index = -1;
    
    nextFunction.apply({}, initialParams);
    
    function nextFunction() {
      var params = [];
      for(var i in arguments)
        params.push(arguments[i]);
      
      ++index;
      if(index === fcts.length)
        return callback.apply(scope, params);
      
      params.push(nextFunction);
      fcts[index].apply(scope, params);
    }
  };
});