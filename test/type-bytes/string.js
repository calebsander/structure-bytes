/*eslint-disable no-undef*/
const type = new t.StringType
const buffer = type.toBuffer()
assert.equal(buffer, bufferFrom([0x41]))
assert.equal(r.type(buffer), new t.StringType)