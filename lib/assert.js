const assert = {
	instanceOf: (instance, constructor) => {
		if (!(instance instanceof constructor || (instance !== undefined && instance !== null && instance.constructor === constructor))) { //second case is necessary for JavaScript primitives
			throw new Error(String(instance) + ' is not an instance of ' + constructor.name);
		}
	},
	integer: (instance) => {
		assert.instanceOf(instance, Number);
		if (!Number.isSafeInteger(instance)) throw new Error(String(instance) + ' is not an integer');
	},
	between: (lower, value, upper, message) => {
		if (value < lower || value >= upper) throw new Error((message || '') + (String(value) + ' is not in [' + String(lower) + ',' + String(upper) + ')'));
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
		if (set.has(value)) throw new Error(String(value) + ' is in the set');
	},
	fail: (message) => {
		throw new Error(message);
	}
};
module.exports = assert;