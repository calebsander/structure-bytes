/*eslint-disable no-undef*/
let type = new t.CharType
let gb = new GrowableBuffer
for (let [invalidValue, message] of [
	[undefined, 'undefined is not an instance of String'],
	[2, '2 is not an instance of String'],
	['', 'String must contain only 1 character'],
	['cd', 'String must contain only 1 character'],
	['é—é', 'String must contain only 1 character']
]) {
	assert.throws(
		() => {
			type.writeValue(gb, invalidValue)
		},
		message
	)
}
type.writeValue(gb, 'é')
assert.equal(gb.toBuffer(), bufferFrom([0xc3, 0xa9]))

const buffer = bufferFrom([0x61, 0xc3, 0xa9, 0x62]) //aéb
assert.equal(r.value({buffer, offset: 1, type}), 'é')