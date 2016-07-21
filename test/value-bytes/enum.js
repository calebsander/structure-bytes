/*eslint-disable no-undef*/
let type = new t.EnumType({
	type: new t.StringType,
	values: [
		'AVAILABLE',
		'IN_USE',
		'MISSING'
	]
});
assert.equal(type.valueBuffer('AVAILABLE'), Buffer.from([0]));
assert.equal(type.valueBuffer('IN_USE'), Buffer.from([1]));
let valueBuffer = type.valueBuffer('MISSING');
assert.equal(valueBuffer, Buffer.from([2]));
assert.equal(r.value({buffer: valueBuffer, type}), 'MISSING');
assert.throws(() => type.writeValue(gb, 'OTHER'));
assert.throws(() => type.writeValue(gb, 101));
assert.throws(() => r.value({buffer: Buffer.from([3]), type}));