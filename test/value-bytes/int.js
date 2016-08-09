/*eslint-disable no-undef*/
let type = new t.IntType;
let gb = new GrowableBuffer;
const VALUE = -2147483648;
type.writeValue(gb, VALUE);
assert.equal(gb.toBuffer(), bufferFrom([0x80, 0x00, 0x00, 0x00]));
assert.equal(r.value({buffer: gb.toBuffer(), type}), VALUE);
assert.equal(type.valueBuffer('-1'), bufferFill(4, 0xff));