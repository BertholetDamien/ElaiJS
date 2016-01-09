define([], function() {
  'use strict';
  var properties = {};
  
  properties.builder = function(proto) {
    proto._create = function(callback) {
      this.created = true;
      this.count = {
        init: 0,
        initVars: 0,
        render: 0,
        refreshRender: 0,
        processRowData: 0,
        fetchData: 0,
        removeRender: 0,
        reload: 0,
        destroy: 0,
        remove: 0
      };
      
      callback();
    };
    
    proto._initialize = function(callback) {
      this.love = this.params.love;
      ++this.count.init;
      callback();
    };
    
    proto._initializeVariables = function() {
      ++this.count.initVars;
    };
    
    proto._fetchData = function(callback) {
      ++this.count.fetchData;
      callback();
    };
    
    proto._processRowData = function(rowData) {
      ++this.count.processRowData;
      return rowData;
    };
    
    proto._refreshRender = function(callback) {
      ++this.count.refreshRender;
      callback();
    };
    
    proto._render = function(callback) {
      ++this.count.render;
      callback();
    };
    
    proto._destroy = function() {
      ++this.count.destroy;
    };
    
    proto._removeRender = function() {
      ++this.count.removeRender;
    };
    
    return proto;
  };
  
  return properties;
});