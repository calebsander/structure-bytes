/*eslint-disable no-undef*/
const type = new t.FloatType
const gb = new GrowableBuffer
type.writeValue(gb, Infinity)
assert.equal(gb.toBuffer(), bufferFrom([0x7f, 0x80, 0x00, 0x00]))
assert.equal(r.value({buffer: gb.toBuffer(), type}), Infinity)

assert.equal(type.valueBuffer(String(Math.E)), bufferFrom([0x40, 0x2d, 0xf8, 0x54]))