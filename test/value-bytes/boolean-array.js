/*eslint-disable no-undef*/
let type = new t.BooleanArrayType;
let gb = new GrowableBuffer;
const VALUE = [true, false, true, true, false, true, true, true, false, false, true];
type.writeValue(gb, VALUE);
assert.equal(gb.toBuffer(), Buffer.from([0, 0, 0, 11, 0b10110111, 0b00100000]));
assert.equal(r.value({buffer: gb.toBuffer(), type}), VALUE);