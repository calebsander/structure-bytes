/*eslint-disable no-undef*/
let type = new t.CharType
let buffer = type.toBuffer()
assert.equal(buffer, bufferFrom([0x40]))
assert.equal(r.type(buffer), new t.CharType)