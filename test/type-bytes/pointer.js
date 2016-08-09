/*eslint-disable no-undef*/
let pointer = new t.PointerType(new t.LongType);
assert.equal(pointer.toBuffer(), bufferFrom([0x70, 0x04]));
assert.equal(r.type(pointer.toBuffer()), pointer);