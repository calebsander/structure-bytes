/*eslint-disable no-undef*/
let type = new t.TimeType
let buffer = type.toBuffer()
assert.equal(buffer, bufferFrom([0x1c]))
assert.equal(r.type(buffer), new t.TimeType)