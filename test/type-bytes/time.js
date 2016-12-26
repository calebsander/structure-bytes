/*eslint-disable no-undef*/
const type = new t.TimeType
const buffer = type.toBuffer()
assert.equal(buffer, bufferFrom([0x1c]))
assert.equal(r.type(buffer), new t.TimeType)