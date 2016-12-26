/*eslint-disable no-undef*/
const type = new t.ByteType
const buffer = type.toBuffer()
assert.equal(buffer, bufferFrom([0x01]))
assert.equal(r.type(buffer), new t.ByteType)