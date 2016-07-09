let type = new t.UnsignedIntType();
let gb = new GrowableBuffer();
const VALUE = 4294967295;
type.writeValue(gb, VALUE);
assert.equal(gb.toBuffer(), Buffer.alloc(4, 0xff));
assert.equal(r.readValue({valueBuffer: gb.toBuffer(), type}), VALUE);