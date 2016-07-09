let type = new t.BooleanTupleType(11);
let gb = new GrowableBuffer();
const VALUE = [true, false, true, true, false, true, true, true, false, false, true];
type.writeValue(gb, VALUE);
assert.equal(gb.toBuffer(), Buffer.from([0b10110111, 0b00100000]));
assert.equal(r.readValue({buffer: gb.toBuffer(), type}), VALUE);