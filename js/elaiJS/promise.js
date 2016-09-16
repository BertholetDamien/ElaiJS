define(["elaiJS/helper"], function(helper) {
	if(window.Promise)
		return window.Promise;
	
	function PromiseElai(resolver) {
		if(!helper.isFunction(resolver))
			throw Error("PromiseElai resolver " + resolver + " is not a function");

		this.pendingThens = [];
		this.status = "pending";

		try {
			resolver(resolved.bind(this), rejected.bind(this));
		} catch(e) {
			rejected.call(this, e);
		}
	}

	PromiseElai.prototype = {
		constructor: PromiseElai,
		then: then,
		length: 1,
		'catch': function(onRejection) {
			return this.then(undefined, onRejection);
		}
	};

	PromiseElai.all = function(promises) {
		return new PromiseElai(function(resolve, reject) {
			var countResult = 0;
			var values = [];

			for(var i in promises) {
				var promise = promises[i];
				if(isThenable(promise))
					addThenListen(promise, i);
				else
					addResult(i, promise);
			}
			checkEnd();

			function addResult(i, value) {
				values[parseInt(i)] = value;
				++countResult;
			}

			function addThenListen(promise, i) {
				promise.then(function(value) {
					addResult(i, value);
					checkEnd();
				}, reject);
			}

			function checkEnd() {
				if(countResult === promises.length)
					resolve(values);
			}
		});
	};

	PromiseElai.race = function(promises) {
		return new PromiseElai(function(resolve, reject) {
			for(var i in promises) {
				var promise = promises[i];
				if(!isThenable(promise))
					resolve(promise);
				else
					promise.then(resolve, reject);
			}
		});
	};

	PromiseElai.resolve = function(value) {
		return new PromiseElai(function(s){s(value);});
	};

	PromiseElai.reject = function(value) {
		return new PromiseElai(function(s, r){r(value);});
	};

	function then(onResolved, onRejection) {
		var promise = this;
		return new PromiseElai(function(resolve, reject) {
			if(promise.status === "pending")
				promise.pendingThens.push(promiseSettled);
			else
				promiseSettled();

			function promiseSettled() {
				setTimeout(function() {
					var callback = (promise.status === "fulfilled") ? onResolved : onRejection;
					if(!helper.isFunction(callback)) {
						callback = (promise.status === "fulfilled") ? resolve : reject;
						return callback(promise.value);
					}
	
					try {
						resolve(callback(promise.value));
					} catch(e) {
						reject(e);
					}
				});
			}
		});
	}

	function resolved(value) {
		return settledPromise.call(this, false, value);
	}

	function rejected(value) {
		return settledPromise.call(this, true, value);
	}

	function settledPromise(isRejected, value) {
		if(this.status !== "pending")
			return;

		if(isThenable(value))
			return value.then(resolved.bind(this), rejected.bind(this));

		this.status = isRejected ? "rejected" : "fulfilled";
		this.value = value;

		while(this.pendingThens.length > 0)
			this.pendingThens.shift()();
		
		return this;
	}

	function isThenable(obj) {
		return obj && helper.isFunction(obj.then);
	}

	return PromiseElai;
});