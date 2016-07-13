let type = new t.MapType(new t.CharType, new t.UnsignedByteType());
let gb = new GrowableBuffer();
let invalidMap = new Map();
invalidMap.set(2, 3);
for (let invalidValue of [{'c': 2}, undefined, null, invalidMap]) {
	assert.throws(() => type.writeValue(gb, invalidValue));
}
let map = new Map();
gb = new GrowableBuffer();
type.writeValue(gb, map);
assert.equal(gb.toBuffer(), Buffer.alloc(4, 0));
map.set('é', 128).set('\n', 254);
gb = new GrowableBuffer();
type.writeValue(gb, map);
assert.equal(gb.toBuffer(), Buffer.from([0, 0, 0, 2, 0xc3, 0xa9, 128, 10, 254]));
assert.equal(r.value({buffer: gb.toBuffer(), type}), map);