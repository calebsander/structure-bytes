/*eslint-disable no-undef*/
const type = new t.PointerType(new t.LongType)
assert.equal(type.toBuffer(), bufferFrom([0x70, 0x04]))
assert.equal(r.type(type.toBuffer()), type)