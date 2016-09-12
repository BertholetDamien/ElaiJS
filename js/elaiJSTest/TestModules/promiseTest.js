define(["elaiJS/promise"],
				function(Promise) {
	'use strict';
	var self = {};
	
	function buildSuccessPromise(value, time) {
		return new Promise(function(resolve, reject) {
			setTimeout(function() {
				resolve(value);
			}, time);
		});
	}

	function buildErrorPromiseWithSuccessPromise(value, time) {
		return new Promise(function(resolve, reject) {
			setTimeout(function() {
				resolve(buildFailPromise(value, time));
			}, time);
		});
	}

	function buildFailPromise(value, time) {
		return new Promise(function(resolve, reject) {
			setTimeout(function() {
				reject(value);
			}, time);
		});
	}

	self.simpleSuccess = function(test) {
		var value = 42;
		buildSuccessPromise(value).then(function(result) {
			test.assertEq(value, result);
			test.done();
		});
	};

	self.simpleFail = function(test) {
		var value = 42;
		buildFailPromise(value).then(undefined, function(result) {
			test.assertEq(value, result);
			test.done();
		});
	};

	self.simpleCatch = function(test) {
		var value = 42;
		buildFailPromise(value).catch(function(result) {
			test.assertEq(value, result);
			test.done();
		});
	};

	self.multipleThen = function(test) {
		var value = 42;
		buildSuccessPromise(value).then(function(result) {
			test.assertEq(value, result);
			return result + 1;
		}).then(function(result) {
			test.assertEq(value + 1, result);
			return result + 1;
		}).then(function(result) {
			test.assertEq(value + 2, result);
			test.done()
		});
	};

	self.thenPromise = function(test) {
		var value = 42;
		var valueHope = "hope";

		buildSuccessPromise(value).then(function(result) {
			test.assertEq(value, result);
			return buildSuccessPromise(valueHope);
		}).then(function(result) {
			test.assertEq(valueHope, result);
			test.done()
		});
	};

	self.thenPromiseError = function(test) {
		var value = 42;
		var valueHope = "hope";

		buildSuccessPromise(value).then(function(result) {
			test.assertEq(value, result);
			return buildFailPromise(valueHope);
		}).then(function(result) {
			test.fail();
		}).then(undefined, function(result) {
			test.assertEq(valueHope, result);
			test.done();
		});
	};

	self.thenPromiseCatchError = function(test) {
		var value = 42;
		var valueHope = "hope";

		buildSuccessPromise(value).then(function(result) {
			test.assertEq(value, result);
			return buildFailPromise(valueHope);
		}).then(function(result) {
			test.fail();
		}).catch(function(result) {
			test.assertEq(valueHope, result);
			test.done();
		});
	};

	self.thenError = function(test) {
		var value = 42;
		var valueHope = "hope";
		var valueError = new Error(valueHope);

		buildSuccessPromise(value).then(function(result) {
			throw valueError;
			test.fail();
		}).then(function(result) {
			test.fail();
		}).catch(function(result) {
			test.assertEq(valueError, result);
			test.done();
		});
	};

	self.thenError2 = function(test) {
		var value = 42;
		var valueHope = "hope";
		var valueError = new Error(valueHope);

		buildSuccessPromise(value).then(function(result) {
			throw valueError;
			test.fail();
		}, function() {
			test.fail();
		}).then(function(result) {
			test.fail();
		}).catch(function(result) {
			test.assertEq(valueError, result);
			test.done();
		});
	};

	self.thenError3 = function(test) {
		var value = 42;
		var valueHope = "hope";
		var valueError = new Error(valueHope);

		buildSuccessPromise(value).then(function(result) {
			throw valueError;
			test.fail();
		}, function() {
			test.fail();
		}).then(function(result) {
			test.fail();
		}, function(result) {
			test.assertEq(valueError, result);
			test.done();
		});
	};

	self.thenError4 = function(test) {
		var value = 42;
		var valueHope = "hope";
		var valueError = new Error(valueHope);

		buildSuccessPromise(value).then(function(result) {
			throw valueError;
			test.fail();
		}, function() {
			test.fail();
		}).then(function(result) {
			test.fail();
		}, function(result) {
			test.assertEq(valueError, result);
			return value;
		}).catch(function(result) {
			test.fail();
		}).then(function(result) {
			test.assertEq(value, result);
			test.done();
		});
	};

	self.thenAfterResolve = function(test) {
		var value = 42;

		var promise = buildSuccessPromise(value);

		promise.then(function(result) {
			test.assertEq(value, result);
			return result;
		});

		promise.then(function(result) {
			test.assertEq(value, result);
			return result + 1;
		}).then(function(result) {
			test.assertEq(value + 1, result);
		});

		promise.then(function(result) {
			test.assertEq(value, result);
			test.done();
		});
	};

	self.thenAfterResolveTimer = function(test) {
		var value = 42;

		var promise = buildSuccessPromise(value, 200);

		promise.then(function(result) {
			test.assertEq(value - 1, result);
			return result;
		});

		promise.then(function(result) {
			test.assertEq(value - 1, result);
			return result + 1;
		}).then(function(result) {
			test.assertEq(value, result);
		});

		promise.then(function(result) {
			test.assertEq(value - 1, result);
			test.done();
		});

		++value;
	};

	self.promiseOfPromise = function(test) {
		var value = 42;

		buildErrorPromiseWithSuccessPromise(value).then(function(result) {
			test.fail();
		}).then(function(result) {
			test.fail();
		}).then(undefined, function(result) {
			test.assertEq(value, result);
			test.done();
		});
	};

	self.thenReturnPromise = function(test) {
		var value = 42;
		var valueHope = "hope";

		buildSuccessPromise(value).then(function(result) {
			test.assertEq(value, result);
			return buildFailPromise(valueHope);
		}).then(function(result) {
			test.fail();
		}).then(undefined, function(result) {
			test.assertEq(valueHope, result);
			test.done();
		});
	};

	self.thenReturnPromises = function(test) {
		var value = 42;
		var valueHope = "hope";
		var valueHappy = "happy";

		buildSuccessPromise(value).then(function(result) {
			test.assertEq(value, result);
			return buildFailPromise(valueHope);
		}).then(function(result) {
			test.fail();
		}).then(undefined, function(result) {
			test.assertEq(valueHope, result);
			return buildSuccessPromise(valueHappy);
		}).then(undefined, function(result) {
			test.fail();
		}).catch(function(result) {
			test.fail();
		}).then(function(result) {
			test.assertEq(valueHappy, result);
			test.done();
		});
	};

	self.thenReturnPromisesTime = function(test) {
		var value = 42;
		var valueHope = "hope";
		var valueHappy = "happy";

		buildSuccessPromise(value, 50).then(function(result) {
			test.assertEq(value, result);
			return buildFailPromise(valueHope, 100);
		}).then(function(result) {
			test.fail();
		}).then(undefined, function(result) {
			test.assertEq(valueHope, result);
			return buildSuccessPromise(valueHappy, 200);
		}).then(undefined, function(result) {
			test.fail();
		}).catch(function(result) {
			test.fail();
		}).then(function(result) {
			test.assertEq(valueHappy, result);
			test.done();
		});
	};

	self.promiseReject = function(test) {
		var value = 42;
		var valueHope = "hope";
		var valueError = new Error(valueHope);

		Promise.reject(value).then(function(result) {
			test.fail();
		}).then(function(result) {
			test.fail();
		}, function(result) {
			test.assertEq(value, result);
			test.done();
		});
	};

	self.promiseRejectCatch = function(test) {
		var value = 42;

		Promise.reject(value).then(function(result) {
			test.fail();
		}).then(function(result) {
			test.fail();
		}).catch(function(result) {
			test.assertEq(value, result);
			test.done();
		});
	};

	self.promiseResolveCatch = function(test) {
		var value = 42;

		Promise.resolve(value).then(undefined, function(result) {
			test.fail();
		}).catch(function(result) {
			test.fail();
		}).then(function(result) {
			test.assertEq(value, result);
			test.done();
		});
	};

	self.promiseAll = function(test) {
		var value = 42;

		Promise.all([value]).then(function(result) {
			test.assertEq(value, result[0]);
			test.done();
		});
	};

	self.promiseAll = function(test) {
		var value = 42;
		var valueHope = "hope";
		var valueHappy = "happy";
		var valueSun = "sun";

		var values = [
			value,
			buildSuccessPromise(valueHope),
			value,
			buildSuccessPromise(valueHappy),
			buildSuccessPromise(valueHope),
			buildSuccessPromise(valueSun), 
			buildSuccessPromise(valueHope)
		];

		Promise.all(values).then(undefined, function() {
			test.fail();
		}).catch(function() {
			test.fail();
		}).then(function(result) {
			test.assertEq(values.length, result.length);
			test.assertEq(value, 			result[0]);
			test.assertEq(valueHope, 	result[1]);
			test.assertEq(value, 			result[2]);
			test.assertEq(valueHappy, result[3]);
			test.assertEq(valueHope,	result[4]);
			test.assertEq(valueSun, 	result[5]);
			test.assertEq(valueHope, 	result[6]);

			test.done();
		});
	};

	self.promiseAllTime = function(test) {
		var value = 42;
		var valueHope = "hope";
		var valueHappy = "happy";
		var valueSun = "sun";

		var values = [
			value,
			buildSuccessPromise(valueHope, 400),
			value,
			buildSuccessPromise(valueHappy, 200),
			buildSuccessPromise(valueHope, 20),
			buildSuccessPromise(valueSun, 200),
			buildSuccessPromise(valueHope)
		];

		Promise.all(values).then(undefined, function() {
			test.fail();
		}).catch(function() {
			test.fail();
		}).then(function(result) {

			test.assertEq(values.length, result.length);
			test.assertEq(value, 			result[0]);
			test.assertEq(valueHope, 	result[1]);
			test.assertEq(value, 			result[2]);
			test.assertEq(valueHappy, result[3]);
			test.assertEq(valueHope,	result[4]);
			test.assertEq(valueSun, 	result[5]);
			test.assertEq(valueHope, 	result[6]);
			test.done();
		});
	};

	self.promiseAllError = function(test) {
		var value = 42;
		var valueHope = "hope";
		var valueHappy = "happy";
		var valueSun = "sun";

		var values = [
			value,
			buildSuccessPromise(valueHope),
			value,
			buildSuccessPromise(valueHappy),
			buildSuccessPromise(valueHope),
			buildFailPromise(valueSun), 
			buildSuccessPromise(valueHope)
		];

		Promise.all(values).then(function() {
			test.fail();
		}).catch(function(result) {
			test.assertEq(valueSun, result);
			test.done();
		});
	};

	self.promiseAllEmpty = function(test) {
		var values = [];

		Promise.all(values).then(function(result) {
			test.assertEq(values.length, result.length);
			test.done();
		}).catch(function(result) {
			test.fail();
		});
	};

	self.promiseRaceSuccess = function(test) {
		var valueHappy = "happy";
		var valueSun = "sun";

		var values = [
			buildFailPromise(valueSun, 2000),
			buildSuccessPromise(valueHappy)
		];

		Promise.race(values).then(undefined, function() {
			test.fail();
		}).then(function(result) {
			test.assertEq(valueHappy, result);
			test.done();
		});
	};

	self.promiseRaceSuccess = function(test) {
		var value = 42;
		var valueHappy = "happy";
		var valueSun = "sun";

		var values = [
			buildFailPromise(valueSun, 2000),
			buildSuccessPromise(valueHappy),
			value
		];

		Promise.race(values).then(undefined, function() {
			test.fail();
		}).then(function(result) {
			test.assertEq(value, result);
			test.done();
		});
	};

	self.promiseRaceError = function(test) {
		var valueHappy = "happy";
		var valueSun = "sun";

		var values = [
			buildSuccessPromise(valueHappy, 2000),
			buildFailPromise(valueSun)
		];

		Promise.race(values).then(function() {
			test.fail();
		}).catch(function(result) {
			test.assertEq(valueSun, result);
			test.done();
		});
	};

	return self;
});