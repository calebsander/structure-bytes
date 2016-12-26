/*eslint-disable no-undef*/
const type = new t.OptionalType(
	new t.ArrayType(
		new t.UnsignedByteType
	)
)
for (const [invalidValue, message] of [
	[2, '2 is not an instance of Array'],
	[[-1], 'Value out of range (-1 is not in [0,256))'],
	['abc', "'abc' is not an instance of Array"]
]) {
	assert.throws(
		() => type.valueBuffer(invalidValue),
		message
	)
}

assert.equal(type.valueBuffer(null), bufferFrom([0]))
assert.equal(r.value({buffer: type.valueBuffer(null), type}), null)

assert.equal(type.valueBuffer(undefined), bufferFrom([0]))
assert.equal(r.value({buffer: type.valueBuffer(undefined), type}), null)

const gb = new GrowableBuffer
const VALUE = [1, 10, 100]
type.writeValue(gb, VALUE)
assert.equal(gb.toBuffer(), bufferFrom([0xFF, 0, 0, 0, 3, 1, 10, 100]))
assert.equal(r.value({buffer: gb.toBuffer(), type}), VALUE)