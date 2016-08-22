/*eslint-disable no-undef*/
let type = new t.ArrayType(
	new t.StructType({
		a: new t.UnsignedShortType,
		b: new t.CharType
	})
)
let gb = new GrowableBuffer
for (let [invalidValue, message] of [
	[undefined, 'undefined is not an instance of Array'],
	[[2, true], '2 is not an instance of Object'],
	['abc', "'abc' is not an instance of Array"],
	[{a: 'b'}, "{ a: 'b' } is not an instance of Array"]
]) {
	assert.throws(
		() => type.writeValue(gb, invalidValue),
		message
	)
}
gb = new GrowableBuffer
const VALUE = [
	{a: 7623, b: 'a'},
	{a: 23, b: 'Ȁ'}
]
type.writeValue(gb, VALUE)
assert.equal(gb.toBuffer(), bufferFrom([0, 0, 0, 2, 0x1d, 0xc7, 0x61, 0, 23, 0xc8, 0x80]))
assert.equal(r.value({buffer: gb.toBuffer(), type}), VALUE)