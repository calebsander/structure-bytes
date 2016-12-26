/*eslint-disable no-undef*/
const type = new t.CharType
const buffer = type.toBuffer()
assert.equal(buffer, bufferFrom([0x40]))
assert.equal(r.type(buffer), new t.CharType)