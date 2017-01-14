/*eslint-disable no-undef*/
const type = new t.SetType(
	new t.StructType({
		a: new t.UnsignedShortType,
		b: new t.CharType
	})
)
const gb = new GrowableBuffer
for (const [invalidValue, message] of [
	[undefined, 'undefined is not an instance of Set'],
	[[2, true], '[ 2, true ] is not an instance of Set'],
	['abc', "'abc' is not an instance of Set"],
	[{a: 'b'}, "{ a: 'b' } is not an instance of Set"],
	[new Set([1]), '1 is not an instance of Object']
]) {
	assert.throws(
		() => type.writeValue(gb, invalidValue),
		message
	)
}

const gb2 = new GrowableBuffer
type.writeValue(gb2, new Set)
assert.equal(gb2.toBuffer(), bufferFrom([0]))
assert.equal(r.value({buffer: gb2.toBuffer(), type}), new Set)

const gb3 = new GrowableBuffer
const VALUE = new Set([
	{a: 2, b: 'c'},
	{a: 420, b: '-'}
])
type.writeValue(gb3, VALUE)
assert.equal(gb3.toBuffer(), bufferFrom([2, 0, 2, 0x63, 0x01, 0xa4, 0x2d]))
assert.equal(r.value({buffer: gb3.toBuffer(), type}), VALUE)