define(["elaiJS/plugin"], function(pluginManager) {
  return function() {
		this._initialize = function _initialize() {
      this.setFeature(this.params.feature);
      this.inDialog = this.params.inDialog !== false ? true : false;
      
      if(this.inDialog)
		    return pluginManager.applyPlugin(getDialogPluginInfo(), this);
		};
		
		function getDialogPluginInfo() {
		  return {
		    priority: 99,
        name: "dialogPlugin",
        url: "elaiJSTest/plugins/dialogPlugin"
		  };
		}
		
		this.setFeature = function setFeature(feature) {
		  unbindFeature.call(this);
			this.feature = feature;
      this.featureCode = "";

      if(this.feature) {
  			var code = this.feature.fct.toString();
        code = code.replace(/[\r\n|\r|\n]/g, "<br/>");
        code = code.replace(/[ ]/g, '<span class="space">&nbsp;&nbsp;</span>');
        this.featureCode = code;
        
        this.feature.bind("test_feature_start", refreshClassS, undefined, this);
  			this.feature.bind("test_feature_end", this.render, undefined, this);
      }
		};
		
		function refreshClassS() {
		  var classNames = ["testing", "tested", "failed", "succeed"];
		  for(var i = 0 ; i < classNames.length ; ++i)
		    refreshClass.call(this, classNames[i]);
		}
		
		function refreshClass(className) {
		  var elementDOM = this.elementDialog || this.elementDOM;
		  if(this.feature && this.feature[className] === true)
		    elementDOM.classList.add(className);
		  else
		    elementDOM.classList.remove(className);
		}
		
		this._render = refreshClassS;
		
		this.findDOMElement = function findDOMElement() {
		  if(this.inDialog)
		    return this.elementDialog;
		};
		
		this._destroy = unbindFeature;
		
		function unbindFeature() {
		  if(this.feature) {
  		  this.feature.unbind("test_feature_start", refreshClassS);
  			this.feature.unbind("test_feature_end", refreshClassS);
		  }
		}
	};
});