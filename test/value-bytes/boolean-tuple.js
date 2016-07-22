/*eslint-disable no-undef*/
let type = new t.BooleanTupleType(11);
let gb = new GrowableBuffer;
const VALUE = [true, false, true, true, false, true, true, true, false, false, true];
type.writeValue(gb, VALUE);
assert.equal(gb.toBuffer(), Buffer.from([0b10110111, 0b00100000]));
assert.equal(r.value({buffer: gb.toBuffer(), type}), VALUE);

let fullType = new t.BooleanTupleType(16);
const VALUE2 = [true, false, true, false, true, false, true, false, false, true, false, true, false, true, false, true];
let buffer = fullType.valueBuffer(VALUE2);
assert.equal(buffer, Buffer.from([0b10101010, 0b01010101]));
assert.equal(r.value({buffer, type: fullType}), VALUE2);