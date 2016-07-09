let type = new t.BooleanType();
let gb = new GrowableBuffer();
type.writeValue(gb, false);
type.writeValue(gb, true);
assert.equal(gb.toBuffer(), Buffer.from([0x00, 0xFF]));
assert.equal(r.readValue({buffer: gb.toBuffer().slice(0, 1), type}), false);
assert.equal(r.readValue({buffer: gb.toBuffer().slice(1, 2), type}), true);
assert.throws(() => r.readValue({buffer: Buffer.from([0b11111110]), type}));