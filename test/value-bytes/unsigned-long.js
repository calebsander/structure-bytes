/*eslint-disable no-undef*/
let type = new t.UnsignedLongType
let gb = new GrowableBuffer
const VALUE = '18446744073709551615'
type.writeValue(gb, VALUE)
assert.equal(gb.toBuffer(), bufferFill(8, 0xff))
assert.equal(r.value({buffer: gb.toBuffer(), type}), VALUE)
assert.throws(
	() => type.writeValue(gb, '120971.00'),
	'Illegal strint format: 120971.00'
)