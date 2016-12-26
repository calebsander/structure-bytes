/*eslint-disable no-undef*/
const type = new t.UnsignedLongType
const buffer = type.toBuffer()
assert.equal(buffer, bufferFrom([0x14]))
assert.equal(r.type(buffer), new t.UnsignedLongType)