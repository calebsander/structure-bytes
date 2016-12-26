/*eslint-disable no-undef*/
const type = new t.OctetsType
const buffer = type.toBuffer()
assert.equal(buffer, bufferFrom([0x42]))
assert.equal(r.type(buffer), new t.OctetsType)