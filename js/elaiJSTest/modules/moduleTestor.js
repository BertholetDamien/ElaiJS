define([  "elaiJS/binder", "elaiJS/ressources", "elaiJS/widget",
          "elaiJSTest/modules/featureTestor", "elaiJS/promise"],
          function(binder, res, widgetManager, FeatureTestor, Promise) {
	return function (index, name) {
    var self = {index: index, name: name};
    binder.addFunctions(self);
    
    function initializeVariables() {
      this.features = [];
      
      this.featuresCount = 0;
      this.featuresTestedCount = 0;
      this.featuresFailedCount = 0;
      this.hasError = false;
      this.hasErrors = false;
      
      this.waiting = false;
      this.testing = false;
      this.tested = false;
      this.failed = false;
      this.succeed = false;
      this.loading = false;
      this.cancelled = false;
      
      if(this.wTestIFrame)
        return this.wTestIFrame.destroy().then(function() {
	      	this.wTestIFrame = undefined;
        }.bind(this));
      else
      	return Promise.resolve();
    }
    
    function initialize() {
      return initializeVariables.call(this).then(function() {
	      var _this = this;
	      this.loading = true;
	      this.fire("test_module_loading");
	      
	      return widgetManager.create("testIFrame", this.name + "IFrame", this).then(function(widget) {
	        _this.wTestIFrame = widget;
	        return _this.wTestIFrame.render(undefined).then(function() {
	          initializeElaiJSTestIFrame.call(_this);
	        });
	      });
      }.bind(this));
    }
    
    function initializeElaiJSTestIFrame() {
      if(this.destroy === true)
        return;
    	
      this.elaiJSTestIFrame = this.wTestIFrame.getElaiJSTestIFrame();
      
      initializeFeatures.call(this, this.elaiJSTestIFrame.features);
      if(this.cancelled)
        return;
        
      this.loading = false;
      this.waiting = true;
      this.fire("test_module_loaded");
    }
    
    function initializeFeatures(rawFeatures) {
      for(var i = 0 ; i < rawFeatures.length ; ++i) {
        var rawFeature = rawFeatures[i];
        var feature = new FeatureTestor(i + 1, rawFeature.name, rawFeature.fct, this);
        feature.bind("test_feature_end", endFeature, undefined, this);
        this.features.push(feature);
      }
      
      this.featuresCount = this.features.length;
      this.fire("features_changed");
    }
    
    self.run = function run() {
      return initialize.call(this).then(runTest.bind(this));
    };
    
    function runTest() {
      this.waiting = false;
      this.testing = true;
      this.fire("test_module_start");
      this.startTime = new Date().getTime();
      
      var _this = this;
      this.elaiJSTestIFrame.run(function() {
        endModuleTests.call(_this);
      });
    }
    
    self.cancel = function cancel() {
      if(this.tested) {
        console.error("Can't cancel a finished test.");
        return;
      }
      
      if(this.elaiJSTestIFrame)
        this.elaiJSTestIFrame.cancel();
      
      this.cancelled = true;
      this.waiting = false;
      this.loading = false;
      this.testing = false;
      this.fire("test_module_cancelled");
    };
    
    self.destroy = function destroy() {
      this.destroy = true;
      return initializeVariables.call(this);
    };
    
    function endModuleTests() {
      if(this.cancelled)
        return;
      
      this.testing = false;
      this.tested = true;
      this.failed = this.hasError;
      this.succeed = !this.hasError;
      
      this.endTime = new Date().getTime();
      this.time = this.endTime - this.startTime;
      this.fire("test_module_end");
    }
    
    function endFeature(event) {
      var feature = event.data;
      var featureHasError = feature.failed;
      if(featureHasError)
        ++this.featuresFailedCount;
      
      this.hasErrors = this.featuresFailedCount > 1;
      this.hasError = this.hasError || featureHasError;
      
      ++this.featuresTestedCount;
      
      this.fire("test_feature_end", {feature: feature});
    }
    
    return self;
	};
});