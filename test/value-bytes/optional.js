/*eslint-disable no-undef*/
let type = new t.OptionalType(
	new t.ArrayType(
		new t.UnsignedByteType
	)
);
let gb = new GrowableBuffer;
for (let [invalidValue, message] of [
	[undefined, 'undefined is not an instance of Array'],
	[2, '2 is not an instance of Array'],
	[[-1], '"value" argument is out of bounds'], //error thrown by Buffer.writeUInt8(-1)
	['abc', "'abc' is not an instance of Array"]
]) {
	assert.throws(
		() => type.writeValue(gb, invalidValue),
		message
	);
}
gb = new GrowableBuffer;
type.writeValue(gb, null);
assert.equal(gb.toBuffer(), Buffer.from([0x00]));
assert.equal(r.value({buffer: gb.toBuffer(), type}), null);
gb = new GrowableBuffer;
const VALUE = [1, 10, 100];
type.writeValue(gb, VALUE);
assert.equal(gb.toBuffer(), Buffer.from([0xFF, 0, 0, 0, 3, 1, 10, 100]));
assert.equal(r.value({buffer: gb.toBuffer(), type}), VALUE);