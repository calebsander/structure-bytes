/*eslint-disable no-undef*/
const type = new t.LongType
const buffer = type.toBuffer()
assert.equal(buffer, bufferFrom([0x04]))
assert.equal(r.type(buffer), new t.LongType)