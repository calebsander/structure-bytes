/*eslint-disable no-undef*/
const type = new t.ShortType
const buffer = type.toBuffer()
assert.equal(buffer, bufferFrom([0x02]))
assert.equal(r.type(buffer), new t.ShortType)