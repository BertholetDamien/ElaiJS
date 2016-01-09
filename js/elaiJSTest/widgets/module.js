define([  "elaiJS/multicallback", "elaiJS/mode"],
          function(multicallback, mode) {
	var properties = {};

	properties.builder = function(proto) {
    proto.module = undefined;
    proto.featureSelected = undefined;
    
    proto._create = function _create(callback) {
      mode.bind(mode.EVENT.modeChanged, modeChanged, undefined, this);
      callback();
    };
    
    function modeChanged() {
      this.dontRunAfterRender = true;
      this.reload();
      featuresChanged.call(this);
    }
    
    proto._initialize = function _initialize(callback) {
      this.module = this.params.module;
      this.module.bind("test_module_cancelled", refreshClassS, undefined, this);
      this.module.bind("test_module_loading", refreshClassS, undefined, this);
      this.module.bind("test_module_loaded", refreshClassS, undefined, this);
      this.module.bind("test_module_start", refreshClassS, undefined, this);

      this.module.bind("features_changed", featuresChanged, undefined, this);
      this.module.bind("test_module_end", moduleEndTest, undefined, this);

      if(this.dontRunAfterRender !== true)
        this.bindOne("afterRender", runModule, undefined, this);
      
      this.collapsed = this.params.neverCollapsed ? false : true;
      createModuleTitleChild.call(this, callback);
    };
		
    function featuresChanged() {
      this.destroyChildsByName("feature");
      createFeaturesChild.call(this, this.render);

      var _this = this;
      this.render(undefined, function() {
        if(_this.featureSelected) {
          var feature = findFeature.call(_this, _this.featureSelected.name);
          selectFeature.call(_this, feature);
        }
      });
    }
		
    function findFeature(name) {
      for(var i = 0 ; i < this.module.features.length ; ++i) {
        var feature = this.module.features[i];
        if(feature.name === name)
          return feature;
      }

      return undefined;
    }
		
    function createModuleTitleChild(callback) {
      var info = {name: "moduleTitle", mode: null};
      var id = this.id + "_title";
      var params = {module: this.module};
      this.createChild(info, id, params, callback);
    }

    function createFeaturesChild(callback) {
      var count = this.module.features.length;
      var multiCallBackFunction = multicallback(count, callback, this);
      for(var i = 0 ; i < count ; ++i) {
        var feature = this.module.features[i];

        var info = {name: "feature", mode: null};
        var id = getFeatureWidgetID.call(this, feature);
        var params = {feature: feature};
        this.createChild(info, id, params, multiCallBackFunction);
      }
    }

    function findElemFeature(feature) {
      var id = getFeatureWidgetID.call(this, feature);
      return document.getElementById(id);
    }

    function getFeatureWidgetID(feature) {
      return this.module.name + "_" + feature.name;
    }

    function moduleEndTest(event) {
      refreshClassS.call(this);

      if(this.module.failed === true)
        showFeatures.call(this);
    }

    function refreshClassS() {
      if(!this.elementDOM)
        return;

      var classNames = ["waiting", "loading", "testing", "cancelled",
                        "tested", "failed", "succeed"];
      for(var i = 0 ; i < classNames.length ; ++i)
        refreshClass.call(this, classNames[i]);
    }

    function refreshClass(className) {
      if(this.module[className] === true)
        this.elementDOM.classList.add(className);
      else
        this.elementDOM.classList.remove(className);
    }

    proto._render = function _render(callback) {
      this.elemFeaturesArea = this.elementDOM.getElementsByClassName("features_area")[0];

      if(!this.params.neverCollapsed)
        bindCollapsedExpanded.call(this);

      if(this.params.selectable)
        this.elementDOM.classList.add("selectable");

      refreshClassS.call(this);
      callback();
    };

    function bindCollapsedExpanded() {
      var elemModuleTitle = this.elementDOM.getElementsByClassName("moduletitle")[0];

      var _this = this;
      elemModuleTitle.onclick = function(event) {
        if(event.target.classList.contains("icon"))
          return;

        toggleFeatures.call(_this);
      };
    }

    proto.afterRenderChildren = function afterRenderChildren() {
      if(this.params.selectable)
        bindFeaturesSelection.call(this);		  
    };

    function bindFeaturesSelection() {
      var elemFeatures = this.elementDOM.getElementsByClassName("feature");
      for(var i = 0 ; i < elemFeatures.length ; ++i)
        bindFeatureSelection.call(this, elemFeatures[i], i);
    }

    function bindFeatureSelection(elemFeature, index) {
      var _this = this;
      elemFeature.onclick = function(event) {
        if(event.target.classList.contains("icon"))
          return;

        selectFeature.call(_this, _this.module.features[index], elemFeature);
      };
    }

    function selectFeature(feature, elemFeature) {
      unselectFeatures.call(this);

      if(feature) {
        if(!elemFeature)
          elemFeature = findElemFeature.call(this, feature);
        elemFeature.classList.add("selected");
      }

      this.featureSelected = feature;
      this.fire("featureSelected", this.featureSelected);
    }

    function unselectFeatures() {
      if(this.featureSelected) {
        var elemLastSelected = findElemFeature.call(this, this.featureSelected);
        if(elemLastSelected)
          elemLastSelected.classList.remove("selected");
      }
    }

    function runModule() {
      var _this = this;
      setTimeout(function() {
        _this.module.run();
      }, 10);
    }

    function toggleFeatures() {
      this.collapsed = !this.collapsed;
      this.elemFeaturesArea.classList.toggle("hide");
      this.elementDOM.classList.toggle("collapsed");
    }

    function hideFeatures() {
      this.collapsed = true;
      this.elemFeaturesArea.classList.add("hide");
      this.elementDOM.classList.add("collapsed");
    }

    function showFeatures() {
      this.collapsed = false;
      this.elemFeaturesArea.classList.remove("hide");
      this.elementDOM.classList.remove("collapsed");
    }
    
    proto._destroy = function() {
      mode.unbind(mode.EVENT.modeChanged, modeChanged);
    };

    return proto;
  };

	return properties;
});