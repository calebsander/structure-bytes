const assert = {
	instanceOf: (instance, constructor) => {
		if (instance.constructor !== constructor) throw new Error(String(instance) + ' is not an instance of ' + constructor.name);
	},
	integer: (instance) => {
		assert.instanceOf(instance, Number);
		if (!Number.isInteger(instance)) throw new Error(String(instance) + ' is not an integer');
	},
	between: (lower, value, upper, message) => {
		if (value < lower || value >= upper) throw new Error((message || '') + (String(value) + ' is not in [' + String(lower) + ',' + String(upper) + ')'));
	}
};
module.exports = assert;