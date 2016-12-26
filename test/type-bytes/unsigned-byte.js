/*eslint-disable no-undef*/
const type = new t.UnsignedByteType
const buffer = type.toBuffer()
assert.equal(buffer, bufferFrom([0x11]))
assert.equal(r.type(buffer), new t.UnsignedByteType)