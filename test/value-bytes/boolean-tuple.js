let type = new t.BooleanTupleType(11);
let gb = new GrowableBuffer();
type.writeValue(gb, [true, false, true, true, false, true, true, true, false, false, true]);
assert.assert(gb.toBuffer().equals(Buffer.from([0b10110111, 0b00100000])));