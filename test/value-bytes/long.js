let type = new t.LongType();
let gb = new GrowableBuffer();
const VALUE = '9223372036854775807';
type.writeValue(gb, VALUE);
assert.equal(gb.toBuffer(), Buffer.from([0x7f, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]));
assert.equal(r.readValue({valueBuffer: gb.toBuffer(), type}), VALUE);