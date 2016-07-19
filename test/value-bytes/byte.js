let type = new t.ByteType;
let gb = new GrowableBuffer;
type.writeValue(gb, -128);
assert.equal(gb.toBuffer(), Buffer.from([0x80]));
assert.equal(r.value({buffer: gb.toBuffer(), type}), -128);