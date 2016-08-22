/*eslint-disable no-undef*/
let type = new t.FloatType
let buffer = type.toBuffer()
assert.equal(buffer, bufferFrom([0x20]))
assert.equal(r.type(buffer), new t.FloatType)