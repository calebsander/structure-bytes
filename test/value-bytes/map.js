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
assert.assert(gb.toBuffer().equals(Buffer.alloc(4, 0)));
map.set('é', 128);
gb = new GrowableBuffer();
type.writeValue(gb, map);
assert.assert(gb.toBuffer().equals(Buffer.from([0, 0, 0, 1, 0xc3, 0xa9, 128])));