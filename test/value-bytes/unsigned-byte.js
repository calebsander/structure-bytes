/*eslint-disable no-undef*/
const type = new t.UnsignedByteType
const gb = new GrowableBuffer
type.writeValue(gb, 255)
assert.equal(gb.toBuffer(), bufferFrom([255]))
assert.equal(r.value({buffer: gb.toBuffer(), type}), 255)

assert.equal(type.valueBuffer('128'), bufferFrom([128]))