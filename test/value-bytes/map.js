/*eslint-disable no-undef*/
const type = new t.MapType(new t.CharType, new t.UnsignedByteType)
for (const [invalidValue, message] of [
	[{c: 2}, '{ c: 2 } is not an instance of Map'],
	[undefined, 'undefined is not an instance of Map'],
	[null, 'null is not an instance of Map'],
	[new Map().set(2, 3), '2 is not an instance of String']
]) {
	assert.throws(
		() => type.valueBuffer(invalidValue),
		message
	)
}

const map = new Map
const gb = new GrowableBuffer
type.writeValue(gb, map)
assert.equal(gb.toBuffer(), bufferFrom([0]))
assert.equal(r.value({buffer: gb.toBuffer(), type}), new Map)

map.set('é', 128).set('\n', 254)
const gb2 = new GrowableBuffer
type.writeValue(gb2, map)
assert.equal(gb2.toBuffer(), bufferFrom([2, 0xc3, 0xa9, 128, 10, 254]))
assert.equal(r.value({buffer: gb2.toBuffer(), type}), map)