/*eslint-disable no-undef*/
const type = new t.TupleType({
	type: new t.BooleanArrayType,
	length: 3
})
const buffer = type.toBuffer()
assert.equal(buffer, bufferFrom([0x50, 0x32, 3]))
assert.equal(r.type(buffer), type)
assert.throws(
	() => new t.TupleType({type: new t.StringType, length: 256}),
	'256 is not in [0,256)'
)