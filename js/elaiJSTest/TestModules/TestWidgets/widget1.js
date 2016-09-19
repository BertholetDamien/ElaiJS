define([], function() {
  'use strict';
  var properties = {};
  
  properties.builder = function(proto) {
    proto._create = function() {
      this.created = true;
      this.count = {
        init: 0,
        render: 0,
        refreshRender: 0,
        processRowData: 0,
        fetchData: 0,
        removeRender: 0,
        reload: 0,
        destroy: 0,
        remove: 0
      };
    };
    
    proto._initialize = function() {
      this.love = this.params.love;
      ++this.count.init;
    };
    
    proto._fetchData = function() {
      ++this.count.fetchData;
    };
    
    proto._processRowData = function(rowData) {
      ++this.count.processRowData;
      return rowData;
    };
    
    proto._refreshRender = function() {
      ++this.count.refreshRender;
    };
    
    proto._render = function() {
      ++this.count.render;
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