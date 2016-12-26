/*eslint-disable no-undef*/
const type = new t.ByteType
const gb = new GrowableBuffer
type.writeValue(gb, -128)
assert.equal(gb.toBuffer(), bufferFrom([-128 + 0x100]))
assert.equal(r.value({buffer: gb.toBuffer(), type}), -128)

assert.equal(type.valueBuffer('1'), bufferFrom([1]))

assert.throws(
	() => type.writeValue(gb, true),
	'true is not an instance of Number'
)
assert.throws(
	() => type.writeValue(gb, ''),
	"'' is not an instance of Number"
)
assert.throws(
	() => type.writeValue(gb, '129'),
	'Value out of range (129 is not in [-128,128))'
)
assert.throws(
	() => type.writeValue(gb, '3.14'),
	'3.14 is not an integer'
)
assert.throws(
	() => type.writeValue(gb, null),
	'null is not an instance of Number'
)