/*eslint-disable no-undef*/
const type = new t.UnsignedIntType
const buffer = type.toBuffer()
assert.equal(buffer, bufferFrom([0x13]))
assert.equal(r.type(buffer), new t.UnsignedIntType)