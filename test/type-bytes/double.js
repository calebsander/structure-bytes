/*eslint-disable no-undef*/
const type = new t.DoubleType
const buffer = type.toBuffer()
assert.equal(buffer, bufferFrom([0x21]))
assert.equal(r.type(buffer), new t.DoubleType)