/*eslint-disable no-undef*/
let type = new t.UnsignedIntType;
let gb = new GrowableBuffer;
const VALUE = 4294967295;
type.writeValue(gb, VALUE);
assert.equal(gb.toBuffer(), Buffer.alloc(4, 0xff));
assert.equal(r.value({buffer: gb.toBuffer(), type}), VALUE);
assert.equal(type.valueBuffer('11111111'), Buffer.from([0, 0xa9, 0x8a, 0xc7]));