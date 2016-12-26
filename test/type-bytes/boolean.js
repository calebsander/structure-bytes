/*eslint-disable no-undef*/
const type = new t.BooleanType
const buffer = type.toBuffer()
assert.equal(buffer, bufferFrom([0x30]))
assert.equal(r.type(buffer), new t.BooleanType)