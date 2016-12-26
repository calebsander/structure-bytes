/*eslint-disable no-undef*/
const type = new t.BigIntType
const buffer = type.toBuffer()
assert.equal(buffer, bufferFrom([0x05]))
assert.equal(r.type(buffer), new t.BigIntType)