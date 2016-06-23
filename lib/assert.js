const assert = {
	instanceOf: (instance, constructor) => {
		if (instance === undefined || instance === null || instance.constructor !== constructor) throw new Error(String(instance) + ' is not an instance of ' + constructor.name);
	},
	integer: (instance) => {
		assert.instanceOf(instance, Number);
		if (!Number.isSafeInteger(instance)) throw new Error(String(instance) + ' is not an integer');
	},
	between: (lower, value, upper, message) => {
		if (value < lower || value >= upper) throw new Error((message || '') + (String(value) + ' is not in [' + String(lower) + ',' + String(upper) + ')'));
	},
	fourByteUnsignedInteger: (value) => {
		assert.integer(value);
		assert.between(0, value, 4294967296);
	}
};
module.exports = assert;