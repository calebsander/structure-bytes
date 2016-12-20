/*eslint-disable no-undef*/
let type = new t.BooleanTupleType(12)
let buffer = type.toBuffer()
assert.equal(buffer, bufferFrom([0x31, 12]))
let readType = r.type(buffer)
assert.equal(readType, type)
assert.throws(
	() => new t.BooleanTupleType(256),
	'256 is not in [0,256)'
)