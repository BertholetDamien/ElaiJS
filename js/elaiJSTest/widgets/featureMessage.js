define([], function() {
	var properties = {};
	properties.plugins = {
    "elaiJS/mustacherend": {inherit: true}
  };
  
	properties.builder = function(proto) {

		proto._initialize = function _initialize() {
			this.feature = this.params;
			this.feature.bind("test_feature_end", this.refreshRender, undefined, this);
		};
		
		proto._render = this._refreshRender;
		
		proto._refreshRender = function _refreshRender() {
		  var message = (this.feature.failed) ? this.feature.errorInfo.message : undefined;
		  
		  var elemBody = document.getElementById(this.id);
		  if(elemBody)
		    elemBody.innerHTML = message ? "Message: " + message : "";
		};
		
		proto._destroy = function _destory() {
		  this.feature.unbind("test_feature_end", this.refreshRender);
		};

		return proto;
	};

	return properties;
});