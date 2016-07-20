/*eslint-disable no-undef*/
let type = new t.SetType(
	new t.StructType({
		a: new t.UnsignedShortType,
		b: new t.CharType
	})
);
let gb = new GrowableBuffer;
for (let invalidValue of [undefined, [2, true], 'abc', {a: 'b'}, new Set([1])]) {
	assert.throws(() => type.writeValue(gb, invalidValue));
}
gb = new GrowableBuffer;
type.writeValue(gb, new Set);
assert.equal(gb.toBuffer(), Buffer.from([0, 0, 0, 0]));
gb = new GrowableBuffer;
const VALUE = new Set().add({a: 2, b: 'c'}).add({a: 420, b: '-'});
type.writeValue(gb, VALUE);
assert.equal(gb.toBuffer(), Buffer.from([0, 0, 0, 2, 0, 2, 0x63, 0x01, 0xa4, 0x2d]));
assert.equal(r.value({buffer: gb.toBuffer(), type}), VALUE);