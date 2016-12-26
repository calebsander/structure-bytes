/*eslint-disable no-undef*/
const type = new t.BooleanArrayType
const buffer = type.toBuffer()
assert.equal(buffer, bufferFrom([0x32]))
assert.equal(r.type(buffer), new t.BooleanArrayType)