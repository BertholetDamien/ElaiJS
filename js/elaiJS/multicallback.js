define([], function() {
	'use strict';

	return function (count, callback, scope) {
	  scope = scope || this;
		
		return function() {
			--count;

			if(count <= 0 && callback)
				callback.call(scope);
		};
	};
});