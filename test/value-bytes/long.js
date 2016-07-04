let type = new t.LongType();
let gb = new GrowableBuffer();
type.writeValue(gb, '9223372036854775807');
assert.equal(gb.toBuffer(), Buffer.from([0x7f, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]));