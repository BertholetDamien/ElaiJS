define([], function() {
  'use strict';
	var properties = {};
  
	properties.builder = function(proto) {
    proto.feature = undefined;
    
		proto._initialize = function _initialize() {
			this.feature = this.params.feature;
			
			this.feature.bind("test_feature_start", refreshClassS, undefined, this);
			this.feature.bind("test_feature_end", this.render, undefined, this);
			
			var featureMessageID = "featuremessage_" + this.id;
			return this.createChild("featureMessage", featureMessageID, this.feature);
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
		
		proto._render = function _render() {
			var elemCodeIcon = this.elementDOM.getElementsByClassName("code_icon")[0];
			elemCodeIcon.onclick = function(event) {
		    alert("This don't work in this mode.");
			};
			
			refreshClassS.call(this);
		};
		
		proto._destroy = function _destroy() {
		  this.feature.unbind("test_feature_start", refreshClassS);
			this.feature.unbind("test_feature_end", this.render);
		};
		
		return proto;
	};

	return properties;
});