let type = new t.BooleanTupleType(11);
let gb = new GrowableBuffer();
type.writeValue(gb, [true, false, true, true, false, true, true, true, false, false, true]);
assert.equal(gb.toBuffer(), Buffer.from([0b10110111, 0b00100000]));