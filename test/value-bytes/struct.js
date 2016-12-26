/*eslint-disable no-undef*/
const type = new t.StructType({
	b: new t.BooleanArrayType,
	i: new t.UnsignedIntType,
	s: new t.StringType
})
assert.throws(
	() => type.valueBuffer({b: [true]}),
	'Value for field "i" missing'
)
assert.throws(
	() => type.valueBuffer({b: 2}),
	'2 is not an instance of Array'
)

const VALUE = {
	b: [true, false, true],
	i: 675,
	s: 'àßçðê'
}
const gb = new GrowableBuffer
type.writeValue(gb, VALUE)
assert.equal(gb.toBuffer(), bufferFrom([0, 0, 0, 3, 0b10100000, 0x00, 0x00, 0x02, 0xa3, 0xc3, 0xa0, 0xc3, 0x9f, 0xc3, 0xa7, 0xc3, 0xb0, 0xc3, 0xaa, 0]))
assert.equal(r.value({buffer: gb.toBuffer(), type}), VALUE)

const typeWithOptionalField = new t.StructType({
	optional: new t.OptionalType(new t.StringType),
	required: new t.DoubleType
})
assert.equal(typeWithOptionalField.valueBuffer({
	required: 2.0, optional: 'test'
}), bufferFrom([
	0xff,
		0x74, 0x65, 0x73, 0x74, 0, //eslint-disable-line indent
	0x40, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
]))
assert.equal(typeWithOptionalField.valueBuffer({required: 2.0}), bufferFrom([
	0,
	0x40, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
]))