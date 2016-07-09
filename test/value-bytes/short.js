let type = new t.ShortType();
let gb = new GrowableBuffer();
const VALUE = 32767;
type.writeValue(gb, VALUE);
assert.equal(gb.toBuffer(), Buffer.from([0x7f, 0xff]));
assert.equal(r.readValue({valueBuffer: gb.toBuffer(), type}), VALUE);