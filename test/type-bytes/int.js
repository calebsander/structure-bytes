/*eslint-disable no-undef*/
const type = new t.IntType
const buffer = type.toBuffer()
assert.equal(buffer, bufferFrom([0x03]))
assert.equal(r.type(buffer), new t.IntType)