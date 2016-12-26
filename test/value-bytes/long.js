/*eslint-disable no-undef*/
const type = new t.LongType
const gb = new GrowableBuffer
const VALUE = '9223372036854775807'
type.writeValue(gb, VALUE)
assert.equal(gb.toBuffer(), bufferFrom([0x7f, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]))
assert.equal(r.value({buffer: gb.toBuffer(), type}), VALUE)

assert.throws(
	() => type.writeValue(gb, '-1.2'),
	'Illegal strint format: -1.2'
)