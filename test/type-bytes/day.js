/*eslint-disable no-undef*/
let type = new t.DayType
let buffer = type.toBuffer()
assert.equal(buffer, bufferFrom([0x1b]))
assert.equal(r.type(buffer), new t.DayType)