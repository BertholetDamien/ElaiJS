define([], function() {
	var properties = {};
	properties.plugins = {
    "elaiJS/mustacherend": {inherit: true}
  };
  
	properties.builder = function(proto) {

		proto._initialize = function _initialize(callback) {
			this.feature = this.params;
			this.feature.bind("test_feature_end", this.refreshRender, undefined, this);
		  callback();
		};
		
		proto._render = this._refreshRender;
		
		proto._refreshRender = function _refreshRender(callback) {
		  var message = (this.feature.failed) ? this.feature.errorInfo.message : undefined;
		  
		  var elemBody = document.getElementById(this.id);
		  if(elemBody)
		    elemBody.innerHTML = message ? "Message: " + message : "";
		  
	    callback();
		};
		
		proto._destroy = function _destory() {
		  this.feature.unbind("test_feature_end", this.refreshRender);
		};

		return proto;
	};

	return properties;
});