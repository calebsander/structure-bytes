/*eslint-disable no-undef*/
let type = new t.StringType
let buffer = type.toBuffer()
assert.equal(buffer, bufferFrom([0x41]))
assert.equal(r.type(buffer), new t.StringType)