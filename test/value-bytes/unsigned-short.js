/*eslint-disable no-undef*/
let type = new t.UnsignedShortType;
let gb = new GrowableBuffer;
const VALUE = 65535;
type.writeValue(gb, VALUE);
assert.equal(gb.toBuffer(), Buffer.alloc(2, 0xff));
assert.equal(r.value({buffer: gb.toBuffer(), type}), VALUE);
assert.equal(type.valueBuffer('1111'), Buffer.from([0x04, 0x57]));