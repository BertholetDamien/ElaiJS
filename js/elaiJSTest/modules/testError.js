define([], function() {
  var self = function(feature, callback) {
    window.onerror = function(message, fileName, lineNumber, colNumber, error) {
      var errorInfo = getErrorInfo(message, fileName, lineNumber, colNumber, error);
      callback(feature, findModuleTestSrc(errorInfo));
      return true; 
    };
  };
  
  function getErrorInfo(message, fileName, lineNumber, colNumber, error) {
    console.error(error);
    
    if(fileName.indexOf("elaiJSTest/test.js") === -1)
      return {lineNumber: lineNumber, fileName: reduceFileName(fileName),
              error: error, message: message};
    
    var stack = error.stack.toString().split(/\r\n|\n/);
    
    var result = findStackLine(stack);
    result.error = error;
    result.message = message;
    return result;
  }
  
  function findStackLine(stack) {
    if(!stack || !stack.length)
      return {lineNumber: 1, fileName: "Unknow"};
    
    var regex = /:(\d+):(?:\d+)[^\d]*$/;
    var lineStr = stack.shift();
    
    if(lineStr.indexOf("elaiJSTest/test.js") !== -1)
      return findStackLine(stack);
    
    var lineParse = regex.exec(lineStr);
    if(!lineParse)
      return findStackLine(stack);
    
    var fileName = lineStr.substring(0, lineParse.index);
    fileName = fileName.split("at ");
    fileName = (fileName.length === 1) ? fileName[0] : fileName[1];
    
    return {lineNumber: lineParse[1], fileName: reduceFileName(fileName)};
  }
  
  function reduceFileName(fileName) {
    if(fileName.startsWith(location.origin))
      fileName = fileName.substring(location.origin.length);
    
    return fileName;
  }
  
  function findModuleTestSrc(errorInfo) {
    return errorInfo;
  }
	
	return self;
});