/*eslint-disable no-undef*/
const type = new t.DateType
const buffer = type.toBuffer()
assert.equal(buffer, bufferFrom([0x1a]))
assert.equal(r.type(buffer), new t.DateType)