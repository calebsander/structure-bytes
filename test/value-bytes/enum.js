let type = new t.EnumType({
	type: new t.StringType(),
	values: [
		'AVAILABLE',
		'IN_USE',
		'MISSING'
	]
});
let gb = new GrowableBuffer();
type.writeValue(gb, 'AVAILABLE');
assert.equal(gb.toBuffer(), Buffer.from([0]));
gb = new GrowableBuffer();
type.writeValue(gb, 'IN_USE');
assert.equal(gb.toBuffer(), Buffer.from([1]));
gb = new GrowableBuffer();
type.writeValue(gb, 'MISSING');
assert.equal(gb.toBuffer(), Buffer.from([2]));
assert.throws(() => type.writeValue(gb, 'OTHER'));
assert.throws(() => type.writeValue(gb, 101));