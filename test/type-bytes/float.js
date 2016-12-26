/*eslint-disable no-undef*/
const type = new t.FloatType
const buffer = type.toBuffer()
assert.equal(buffer, bufferFrom([0x20]))
assert.equal(r.type(buffer), new t.FloatType)