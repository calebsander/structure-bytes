/*eslint-disable no-undef*/
const type = new t.BigUnsignedIntType
const buffer = type.toBuffer()
assert.equal(buffer, bufferFrom([0x15]))
assert.equal(r.type(buffer), new t.BigUnsignedIntType)