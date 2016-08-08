/*eslint-disable no-undef*/
let type = new t.ByteType;
let gb = new GrowableBuffer;
type.writeValue(gb, -128);
assert.equal(gb.toBuffer(), Buffer.from([0x80]));
assert.equal(r.value({buffer: gb.toBuffer(), type}), -128);
assert.equal(type.valueBuffer('1'), Buffer.from([1]));
assert.throws(
	() => type.writeValue(gb, true),
	'true is not an instance of Number'
);
assert.throws(
	() => type.writeValue(gb, ''),
	"'' is not an instance of Number"
);
assert.throws(
	() => type.writeValue(gb, '129'),
	'"value" argument is out of bounds'
);
assert.throws(
	() => type.writeValue(gb, '3.14'),
	'3.14 is not an integer'
);
assert.throws(
	() => type.writeValue(gb, null),
	'null is not an instance of Number'
);