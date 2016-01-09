define([], function() {
  'use strict';
	var properties = {};
  
	properties.builder = function(proto) {
    proto.feature = undefined;
    
		proto._initialize = function _initialize(callback) {
			this.feature = this.params.feature;
			
			this.feature.bind("test_feature_start", refreshClassS, undefined, this);
			this.feature.bind("test_feature_end", this.render, undefined, this);
			
			var featureMessageID = "featuremessage_" + this.id;
			this.createChild("featureMessage", featureMessageID, this.feature, callback);
		};
		
		function refreshClassS() {
		  var classNames = ["testing", "tested", "failed", "succeed"];
		  for(var i = 0 ; this.elementDOM && i < classNames.length ; ++i)
		    refreshClass.call(this, classNames[i]);
		}
		
		function refreshClass(className) {
		  if(this.feature[className] === true)
		    this.elementDOM.classList.add(className);
		  else
		    this.elementDOM.classList.remove(className);
		}
		
		proto._render = function _render(callback) {
			var elemCodeIcon = this.elementDOM.getElementsByClassName("code_icon")[0];
      var _this = this;			
			elemCodeIcon.onclick = function(event) {
		    showFeatureCode.call(_this);
			};
			
			refreshClassS.call(this);
			callback();
		};
		
		proto.needRenderChildren = false;
		
		function showFeatureCode() {
		  if(this.wFeatureCode)
		    this.wFeatureCode.render();
		  else
		    createFeatureCodeWidget.call(this, showFeatureCode);
		}
		
		function createFeatureCodeWidget(callback) {
		  var _this = this;
		  var params = {feature: this.feature};
      var featureMessageID = "featurecode_" + this.id;
      
		  this.createChild("featureCode", featureMessageID, params, function(child) {
        _this.wFeatureCode = child;
        callback.call(_this);
			});
		}
		
		proto._destroy = function _destroy() {
		  this.feature.unbind("test_feature_start", refreshClassS);
			this.feature.unbind("test_feature_end", this.render);
		};
		
		return proto;
	};

	return properties;
});