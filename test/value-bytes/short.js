let type = new t.ShortType;
let gb = new GrowableBuffer;
const VALUE = -32768;
type.writeValue(gb, VALUE);
assert.equal(gb.toBuffer(), Buffer.from([0x80, 0x00]));
assert.equal(r.value({buffer: gb.toBuffer(), type}), VALUE);