let type = new t.UnsignedLongType();
let gb = new GrowableBuffer();
const VALUE = '18446744073709551615';
type.writeValue(gb, VALUE);
assert.equal(gb.toBuffer(), Buffer.alloc(8, 0xff));
assert.equal(r.readValue({buffer: gb.toBuffer(), type}), VALUE);