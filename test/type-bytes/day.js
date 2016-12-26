/*eslint-disable no-undef*/
const type = new t.DayType
const buffer = type.toBuffer()
assert.equal(buffer, bufferFrom([0x1b]))
assert.equal(r.type(buffer), new t.DayType)