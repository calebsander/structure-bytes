/*eslint-disable no-undef*/
let struct = new t.StructType({
	bobbé: new t.BooleanType,
	'': new t.IntType
})
let buffer = struct.toBuffer()
assert.equal(buffer, bufferFrom([0x51, 2, 0, 0x03, 6, 0x62, 0x6f, 0x62, 0x62, 0xc3, 0xa9, 0x30]))
assert.equal(r.type(buffer), struct)
for (let i = 0; i < buffer.length; i++) {
	assert.throws(
		() => r.type(buffer.slice(0, i)),
		'Buffer is not long enough'
	)
}

assert.throws(
	() => {
		let struct = {}
		for (let i = 1; i <= 256; i++) struct[(i % 2 ? 'a' : 'b').repeat(Math.floor(i / 2))] = new t.IntType
		new t.StructType(struct) //eslint-disable-line no-new
	},
	'256 fields is too many'
)
let longString = 'a'.repeat(256)
assert.throws(
	() => new t.StructType({
		[longString]: new t.ByteType
	}),
	'Field name ' + longString + ' is too long'
)
let date = new Date
assert.throws(
	() => new t.StructType({
		field: date
	}),
	date.toString() + ' is not a valid field type'
)