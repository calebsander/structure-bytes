/*eslint-disable no-undef*/
const type = new t.FlexUnsignedIntType
const buffer = type.toBuffer()
assert.equal(buffer, bufferFrom([0x17]))
assert.equal(r.type(buffer), new t.FlexUnsignedIntType)