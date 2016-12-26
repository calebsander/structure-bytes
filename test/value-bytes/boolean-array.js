/*eslint-disable no-undef*/
const type = new t.BooleanArrayType
const gb = new GrowableBuffer
const VALUE = [true, false, true, true, false, true, true, true, false, false, true]
type.writeValue(gb, VALUE)
assert.equal(gb.toBuffer(), bufferFrom([0, 0, 0, VALUE.length, 0b10110111, 0b00100000]))
assert.equal(r.value({buffer: gb.toBuffer(), type}), VALUE)