/*eslint-disable no-undef*/
const type = new t.UnsignedShortType
const buffer = type.toBuffer()
assert.equal(buffer, bufferFrom([0x12]))
assert.equal(r.type(buffer), new t.UnsignedShortType)