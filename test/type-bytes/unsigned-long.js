/*eslint-disable no-undef*/
let type = new t.UnsignedLongType
let buffer = type.toBuffer()
assert.equal(buffer, bufferFrom([0x14]))
assert.equal(r.type(buffer), new t.UnsignedLongType)