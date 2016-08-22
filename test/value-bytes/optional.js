/*eslint-disable no-undef*/
let type = new t.OptionalType(
	new t.ArrayType(
		new t.UnsignedByteType
	)
)
let gb = new GrowableBuffer
for (let [invalidValue, message] of [
	[undefined, 'undefined is not an instance of Array'],
	[2, '2 is not an instance of Array'],
	[[-1], 'Value out of range (-1 is not in [0,256))'],
	['abc', "'abc' is not an instance of Array"]
]) {
	assert.throws(
		() => type.writeValue(gb, invalidValue),
		message
	)
}
gb = new GrowableBuffer
type.writeValue(gb, null)
assert.equal(gb.toBuffer(), bufferFrom([0x00]))
assert.equal(r.value({buffer: gb.toBuffer(), type}), null)
gb = new GrowableBuffer
const VALUE = [1, 10, 100]
type.writeValue(gb, VALUE)
assert.equal(gb.toBuffer(), bufferFrom([0xFF, 0, 0, 0, 3, 1, 10, 100]))
assert.equal(r.value({buffer: gb.toBuffer(), type}), VALUE)