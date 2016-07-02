function toString(value) {
	if (value.toString === new Object().toString) return '[object ' + value.constructor.name + ']';
	else return value.toString();
}

const assert = {
	instanceOf: (instance, constructor) => {
		if (!(instance instanceof constructor || (instance !== undefined && instance !== null && instance.constructor === constructor))) { //second case is necessary for JavaScript primitives
			throw new TypeError(toString(instance) + ' is not an instance of ' + constructor.name);
		}
	},
	integer: (instance) => {
		assert.instanceOf(instance, Number);
		if (!Number.isSafeInteger(instance)) throw new RangeError(toString(instance) + ' is not an integer');
	},
	between: (lower, value, upper, message = '') => {
		if (value < lower || value >= upper) throw new RangeError(message + toString(value) + ' is not in [' + toString(lower) + ',' + toString(upper) + ')');
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
		if (set.has(value)) throw new Error(toString(value) + ' is in the set');
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
	}
};
module.exports = assert;