define(["elaiJS/widget"], function(widgetManager) {
  
  function start() {
    widgetManager.createAndRender("body", "bodytest");
  }
  
  return {start: start};
});

/*
  TODO
    Dans overview, Si module expand et qu'on change de mode, collapse not set correctly.
    Navigator => Save state et can't change page + Integration in Test Widget
    Tester helper.parseJSON
    
    Transformer avec Polymer?
*/