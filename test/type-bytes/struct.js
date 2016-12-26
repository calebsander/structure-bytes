/*eslint-disable no-undef*/
const type = new t.StructType({
	bobbé: new t.BooleanType,
	'': new t.IntType
})
const buffer = type.toBuffer()
assert.equal(buffer, bufferFrom([0x51, 2, 0, 0x03, 6, 0x62, 0x6f, 0x62, 0x62, 0xc3, 0xa9, 0x30]))
assert.equal(r.type(buffer), type)
for (let i = 0; i < buffer.length; i++) {
	assert.throws(
		() => r.type(buffer.slice(0, i)),
		'Buffer is not long enough'
	)
}

//Test invalid field request
assert.throws(
	() => {
		const struct = {}
		for (let i = 1; i <= 256; i++) struct[(i % 2 ? 'a' : 'b').repeat(Math.floor(i / 2))] = new t.IntType
		new t.StructType(struct) //eslint-disable-line no-new
	},
	'256 fields is too many'
)
const longString = 'a'.repeat(256)
assert.throws(
	() => new t.StructType({
		[longString]: new t.ByteType
	}),
	'Field name ' + longString + ' is too long'
)
const date = new Date
assert.throws(
	() => new t.StructType({
		field: date
	}),
	date.toString() + ' is not a valid field type'
)

//Test hasOwnProperty()
class TestClass {
	constructor() {
		this.one = new t.StringType
		this.two = new t.CharType
	}
}
TestClass.prototype.abc = () => 23
const testObject = new TestClass
let foundKey = false
for (const key in testObject) {
	if (key === 'abc') {
		foundKey = true
		break
	}
}
assert.assert(foundKey, 'Expected "abc" to be a key in testObject')
const testStruct = new t.StructType(testObject)
assert.equal(testStruct.fields.length, 2)