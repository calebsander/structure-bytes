const util = require('util');

const assert = {
	instanceOf: (instance, constructor) => {
		if (!(instance instanceof constructor || (instance !== undefined && instance !== null && instance.constructor === constructor))) { //second case is necessary for JavaScript primitives
			throw new TypeError(util.inspect(instance) + ' is not an instance of ' + constructor.name);
		}
	},
	integer: (instance) => {
		assert.instanceOf(instance, Number);
		if (!Number.isSafeInteger(instance)) throw new RangeError(util.inspect(instance) + ' is not an integer');
	},
	between: (lower, value, upper, message = '') => {
		if (value < lower || value >= upper) throw new RangeError(message + util.inspect(value) + ' is not in [' + util.inspect(lower) + ',' + util.inspect(upper) + ')');
	},
	byteUnsignedInteger: (value) => {
		assert.integer(value);
		assert.between(0, value, 256);
	},
	fourByteUnsignedInteger: (value) => {
		assert.integer(value);
		assert.between(0, value, 4294967296);
	},
	notIn: (value, set) => {
		if (set.has(value)) throw new Error(util.inspect(value) + ' is in the set');
	},
	fail: (message) => {
		throw new Error(message);
	},
	assert: (condition, message) => {
		if (!condition) assert.fail(message);
	},
	throws: (block) => {
		let success = true;
		try {
			block();
			success = false;
		}
		catch (e) {}
		assert.assert(success, 'Should throw an error');
	},
	equal: (actual, expected) => {
		const error = new RangeError('Expected ' + util.inspect(expected) + ' but got ' + util.inspect(actual));
		if (!(expected === undefined || expected === null) && expected.equals instanceof Function) {
			let equals;
			try { equals = expected.equals(actual); }
			catch (e) { throw error; }
			if (!equals) throw error;
		}
		else {
			if (expected !== actual) throw error;
		}
	}
};
module.exports = assert;