/*eslint-disable no-undef*/
let tooManyValues = new Array(256)
for (let i = 0; i < tooManyValues.length; i++) tooManyValues[i] = 'A'.repeat(i)
for (let [invalidValues, message] of [
	['asdf', "'asdf' is not an instance of Array"],
	[[2], '2 is not an instance of String'],
	[[true], 'true is not an instance of String'],
	[[undefined], 'undefined is not an instance of String'],
	[['abc', 3], '3 is not an instance of String'],
	[['1', '2', '1'], "Value is repeated: '1'"],
	[tooManyValues, '256 values is too many']
]) {
	assert.throws(
		() => {
			new t.EnumType({ //eslint-disable-line no-new
				type: new t.StringType,
				values: invalidValues
			})
		},
		message
	)
}
let type = new t.EnumType({
	type: new t.StringType,
	values: [
		'ABC',
		'DEF',
		'GHI'
	]
})
assert.equal(type.toBuffer(), bufferFrom([0x55, 0x41, 3, 0x41, 0x42, 0x43, 0, 0x44, 0x45, 0x46, 0, 0x47, 0x48, 0x49, 0]))
assert.equal(r.type(type.toBuffer()), type)

const HUMAN = {heightFt: 6, speedMph: 28}
const CHEETAH = {heightFt: 3, speedMph: 70}
type = new t.EnumType({
	type: new t.StructType({
		heightFt: new t.FloatType,
		speedMph: new t.UnsignedByteType
	}),
	values: [
		HUMAN,
		CHEETAH
	]
})
assert.equal(type.toBuffer(), bufferFrom([0x55, 0x51, 2, 8, 0x68, 0x65, 0x69, 0x67, 0x68, 0x74, 0x46, 0x74, 0x20, 8, 0x73, 0x70, 0x65, 0x65, 0x64, 0x4d, 0x70, 0x68, 0x11, 2, 0x40, 0xc0, 0x00, 0x00, 28, 0x40, 0x40, 0x00, 0x00, 70]))
assert.equal(r.type(type.toBuffer()), type)