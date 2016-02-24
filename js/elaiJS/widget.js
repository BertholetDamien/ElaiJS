define([  "elaiJS/configuration", "elaiJS/webservice", "elaiJS/plugin",
          "elaiJS/helper", "elaiJS/mode"],
          function(config, webservice, pluginManager, helper, mode) {
	'use strict';
  
	var self = {};
  
	var widgetsProtoInfo = {};
	var widgets = {};
  
	self.widgets = widgets;
  
	self.create = function create(widgetInfo, id, params, callback) {
		if(!id)
			throw new Error("ID are required");
		
    widgetInfo = buildWidgetParams(widgetInfo);
    
		if(!widgetInfo.name)
			throw new Error("Name are required");
    
		buildPrototypeInstance(widgetInfo, function (widgetPrototype) {
			createWidget(widgetInfo, id, params, widgetPrototype, callback);
		});
	};
	
	self.createAndRender = function createAndRender(widgetInfo, id, params, renderParams, callback) {
		self.create(widgetInfo, id, params, function(widget) {
		  widget.render(renderParams, function() {
		    if(helper.isFunction(callback))
		      callback(widget);
		  });
		});
	};

	self.add = function add(widget) {
		if(!widget)
			throw new Error("Widget undefined");

		if(!widget.id)
			throw new Error("The widget has no id: " + widget);

		if(widgets[widget.id])
			throw new Error("A Widget already exist with this id  : " + widget.id);

		widgets[widget.id] = widget;
		addChildren(widget);
	};

	self.removeByID = function removeByID(id) {
		var widget = self.get(id);
		if(widget)
			self.remove(widget);
	};

	self.remove = function remove(widget) {
		if(!widget)
			throw new Error("Widget undefined");

		if(!widget.id)
			throw new Error("The widget has no id: " + widget);

		delete widgets[widget.id];
		removeChildren(widget);
	};

	self.get = function get(id) {
		return widgets[id];
	};

	self.getWidgetsByName = function getWidgetByName(name) {
		var result = [];
		for(var key in widgets) {
			var widget = widgets[key];
			if(widget.name === name)
				result.push(widget);
		}

		return result;
	};

	function addChildren(widget) {
		for(var key in widget.children)
			self.add(widget.children[key]);
	}

	function removeChildren(widget) {
		for(var key in widget.children)
			self.remove(widget.children[key]);
	}

	function createWidget(widgetInfo, id, params, widgetPrototype, callback) {
		var widget = instanciateWidget(widgetInfo, id, widgetPrototype);
    self.add(widget);
    
    pluginManager.applyDefaultPlugins(widget, widgetPrototype, function() {
      widget.create(function() {
		    widget.initialize(params, function() {
		      callback(widget);
		    });
      });
	  });
	}

	function instanciateWidget(widgetInfo, id, widgetPrototype) {
		return Object.create(widgetPrototype.proto, {
			name: {
				value:      widgetInfo.name,
				enumerable: true
			},
			id: {
				value:      id,
				enumerable: true
			},
			mode: {
				value:      widgetInfo.mode,
				enumerable: true
			}
		});
	}
	
	function buildWidgetParams(rawParams, defaultMode) {
    var params = rawParams;
    if(!helper.isObject(params))
      params = {name: rawParams};
    
    params.mode = rawParams.mode || defaultMode || mode.getMode();
    if(rawParams.mode === null || defaultMode === null)
      params.mode = undefined;
    
    return params;
	}

	/**************************************************************************
	************************** Prototype Management **************************
	**************************************************************************/
	function buildPrototypeInstance(widgetInfo, callback) {
    getWidgetPrototypeInfo(widgetInfo, function(widgetPrototypeInfo) {
  		callback(buildWidgetPrototypeInfoInstance(widgetPrototypeInfo));
    });
	}
	
	function getWidgetPrototypeInfo(widgetInfo, callback) {
		var widgetProtoInfo;
		if(widgetsProtoInfo[widgetInfo.name])
			widgetProtoInfo = widgetsProtoInfo[widgetInfo.name][widgetInfo.mode];
    
		if(!widgetProtoInfo)
			loadWidgetPrototype(helper.clone(widgetInfo), callback);
		else if(helper.isFunction(callback))
		  callback(widgetProtoInfo);
	}

	function loadWidgetPrototype(widgetInfo, callback) {
		webservice.loadWidget(widgetInfo, function(properties) {
		  if(helper.isFunction(properties))
		    properties = {builder: properties};
	    
		  if(!properties.builder)
		    throw new Error("No builder for widget " + widgetInfo.name);
			
			var widgetParentInfo = buildWidgetParentInfo(widgetInfo, properties);
			if(widgetParentInfo === null)
			  return callback(addWidgetProtoInfo(widgetInfo, properties));
			
			getWidgetPrototypeInfo(widgetParentInfo, function(widgetParentProtoInfo) {
		    callback(addWidgetProtoInfo(widgetInfo, properties, widgetParentProtoInfo));
			});
		});
	}
	
	function buildWidgetParentInfo(widgetInfo, widgetPrototypeInfo) {
	  var parent = widgetPrototypeInfo.parent;
	  var defaultParent = config.elaiJS.defaultParentWidget;
	  var widgetParentInfo = (parent === undefined) ? defaultParent : parent;
  	if(widgetParentInfo !== null)
      widgetParentInfo = buildWidgetParams(widgetParentInfo, widgetInfo.mode);
    
    return widgetParentInfo;
	}
	
	function addWidgetProtoInfo(widgetInfo, properties, parentPrototypeInfo) {
		if(!widgetsProtoInfo[widgetInfo.name])
			widgetsProtoInfo[widgetInfo.name] = {};
    
    var widgetProtoInfo =   {
                              properties: properties,
                              name:       widgetInfo.name,
                              mode:       widgetInfo.mode,
                              parent:     parentPrototypeInfo
                            };
		widgetsProtoInfo[widgetInfo.name][widgetInfo.mode] = widgetProtoInfo;
    return widgetProtoInfo;
	}
	
	function buildWidgetPrototypeInfoInstance(widgetProtoInfo) {
    var protoInstance = {};
    if(widgetProtoInfo.parent)
      protoInstance = instanciateWidgetPrototypeRecursif(widgetProtoInfo.parent);
    
    widgetProtoInfo.properties.builder.call(protoInstance, protoInstance);
    widgetProtoInfo = helper.clone(widgetProtoInfo);
    widgetProtoInfo.proto = protoInstance;
    
    return widgetProtoInfo;
	}
	
	function instanciateWidgetPrototypeRecursif(widgetProtoInfo) {
    if(!widgetProtoInfo.parent)
      return instanciateWidgetPrototype(widgetProtoInfo, {});
    
    var parentInstance = instanciateWidgetPrototypeRecursif(widgetProtoInfo.parent);
    return instanciateWidgetPrototype(widgetProtoInfo, parentInstance);
	}
	
	function instanciateWidgetPrototype(widgetProtoInfo, parentInstance) {
	  widgetProtoInfo.properties.builder.call(parentInstance, parentInstance);
    return Object.create(parentInstance, {
  		super: {
		    value:      parentInstance,
		    enumerable: true
  		}
    });
	}

	return self;
});