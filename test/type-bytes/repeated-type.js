/*eslint-disable no-undef*/
const REPEATED_TYPE = 0xff
const personType = new t.StructType({
	dob: new t.DateType,
	id: new t.UnsignedShortType,
	name: new t.StringType
})
const tribeType = new t.StructType({
	leader: personType,
	members: new t.SetType(personType),
	money: new t.MapType(personType, new t.FloatType)
})
const buffer = tribeType.toBuffer()
assert.equal(buffer,
	concat([
		bufferFrom([0x51, 3, 6, 0x6c, 0x65, 0x61, 0x64, 0x65, 0x72]),
		personType.toBuffer(),
		bufferFrom([7, 0x6d, 0x65, 0x6d, 0x62, 0x65, 0x72, 0x73, 0x53, REPEATED_TYPE, 0, 27]),
		bufferFrom([5, 0x6d, 0x6f, 0x6e, 0x65, 0x79, 0x54, REPEATED_TYPE, 0, 37, 0x20])
	])
)
assert.equal(r.type(buffer), tribeType)
const personCube = new t.ArrayType(
	new t.ArrayType(
		new t.ArrayType(
			new t.ChoiceType([
				new t.ByteType,
				new t.UnsignedIntType,
				new t.UnsignedLongType,
				new t.StringType,
				new t.OptionalType(personType)
			])
		)
	)
)
assert.equal(personCube.toBuffer(), concat([
	bufferFrom([0x52, 0x52, 0x52, 0x56, 5, 0x01, 0x13, 0x14, 0x41, 0x60]),
	personType.toBuffer() //ensure that no repeated type is used
]))