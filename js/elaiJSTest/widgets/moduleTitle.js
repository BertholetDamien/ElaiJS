define([  "elaiJS/multicallback"],
          function(multicallback) {
	var properties = {};
	properties.plugins = {
    "elaiJS/mustacherend": {CSS: false}
  };
  
	properties.builder = function(proto) {
    
		proto._initialize = function _initialize() {
			this.module = this.params.module;
      
      this.module.bind("test_module_cancelled", render, undefined, this);
      this.module.bind("test_module_loading", render, undefined, this);
      this.module.bind("test_module_loaded", render, undefined, this);
			this.module.bind("test_module_start", render, undefined, this);
			this.module.bind("test_feature_end", render, undefined, this);
			this.module.bind("test_module_end", render, undefined, this);
		};
		
		proto._render = function _render() {
		  var _this = this;
		  
		  var elemReloadIcon = this.elementDOM.getElementsByClassName("reload_icon")[0];
		  elemReloadIcon.onclick = function() {
		    _this.module.run();
		  };
		  
		  var elemCancelIcon = this.elementDOM.getElementsByClassName("cancel_icon")[0];
		  elemCancelIcon.onclick = function() {
		    _this.module.cancel();
		  };
		};
		
		function render(event) {
		  this.render();
		}
		
		return proto;
	};

	return properties;
});