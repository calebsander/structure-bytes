/*eslint-disable no-undef*/
const type = new t.ChoiceType([new t.UnsignedByteType, new t.UnsignedLongType, new t.StringType])
const buffer = type.toBuffer()
assert.equal(buffer, bufferFrom([0x56, 3, 0x11, 0x14, 0x41]))
assert.equal(r.type(buffer), type)

const tooManyTypes = new Array(256)
for (let i = 0; i < tooManyTypes.length; i++) {
	let type = new t.ShortType
	for (let j = 0; j < i; j++) type = new t.ArrayType(type)
	tooManyTypes[i] = type
}
assert.throws(
	() => new t.ChoiceType(tooManyTypes),
	'256 types is too many'
)