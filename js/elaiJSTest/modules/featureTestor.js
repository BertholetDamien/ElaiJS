define([  "elaiJS/binder"],
          function(binder) {
	return function (index, name, fct , module) {
    var self = {
                index: index,
                name: name,
                fct: fct,
                module: module
    };
    binder.addFunctions(self);
    
    self.testing = false;
    self.tested = false;
    self.failed = false;
    self.succeed = false;
    
    function initialize() {
      var testModule = this.module.elaiJSTestIFrame;
      testModule.bind("start_test_feature_" + this.name, startFeature, undefined, this);
      testModule.bind("end_test_feature_" + this.name, endFeature, undefined, this);
    }
    
    function startFeature() {
      this.testing = true;
      this.startTime = new Date().getTime();
      this.fire("test_feature_start");
    }
    
    function endFeature(event) {
      var errorInfo = event.data;
      this.testing = false;
      this.tested = true;
      
      if(errorInfo !== undefined) {
        this.errorInfo = errorInfo;
        this.failed = true;
      }
      else {
        this.succeed = true;
      }
      
      this.endTime = new Date().getTime();
      this.time = this.endTime - this.startTime;
      this.fire("test_feature_end", this);
    }
    
    initialize.call(self);
    
    return self;
	};
});