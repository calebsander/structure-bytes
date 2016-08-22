/*eslint-disable no-undef*/
let type = new t.MapType(new t.CharType, new t.UnsignedByteType)
let gb = new GrowableBuffer
for (let [invalidValue, message] of [
	[{c: 2}, '{ c: 2 } is not an instance of Map'],
	[undefined, 'undefined is not an instance of Map'],
	[null, 'null is not an instance of Map'],
	[new Map().set(2, 3), '2 is not an instance of String']
]) {
	assert.throws(
		() => type.writeValue(gb, invalidValue),
		message
	)
}
let map = new Map
gb = new GrowableBuffer
type.writeValue(gb, map)
assert.equal(gb.toBuffer(), bufferFill(4, 0))
map.set('é', 128).set('\n', 254)
gb = new GrowableBuffer
type.writeValue(gb, map)
assert.equal(gb.toBuffer(), bufferFrom([0, 0, 0, 2, 0xc3, 0xa9, 128, 10, 254]))
assert.equal(r.value({buffer: gb.toBuffer(), type}), map)