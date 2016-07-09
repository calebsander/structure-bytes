let type = new t.UnsignedShortType();
let gb = new GrowableBuffer();
const VALUE = 65535;
type.writeValue(gb, VALUE);
assert.equal(gb.toBuffer(), Buffer.alloc(2, 0xff));
assert.equal(r.readValue({valueBuffer: gb.toBuffer(), type}), VALUE);