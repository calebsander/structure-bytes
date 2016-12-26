/*eslint-disable no-undef*/
const type = new t.BooleanType
const gb = new GrowableBuffer
type.writeValue(gb, false)
type.writeValue(gb, true)
assert.equal(gb.toBuffer(), bufferFrom([0x00, 0xff]))
assert.equal(r.value({buffer: gb.toBuffer().slice(0, 1), type}), false)
assert.equal(r.value({buffer: gb.toBuffer().slice(1, 2), type}), true)

assert.throws(
	() => r.value({buffer: bufferFrom([0xfe]), type}),
	'0xfe is an invalid Boolean value'
)