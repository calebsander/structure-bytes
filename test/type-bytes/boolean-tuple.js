/*eslint-disable no-undef*/
const type = new t.BooleanTupleType(12)
const buffer = type.toBuffer()
assert.equal(buffer, bufferFrom([0x31, 12]))
const readType = r.type(buffer)
assert.equal(readType, type)
assert.throws(
	() => new t.BooleanTupleType(256),
	'256 is not in [0,256)'
)