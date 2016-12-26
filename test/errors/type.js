/*eslint-disable no-undef*/
assert.throws(
	() => t.Type._value,
	'Generic Type has no value byte'
)
const type = new t.Type
assert.throws(
	() => type.valueBuffer(23),
	'Generic Type has no value representation'
)
assert.equal(new t.UnsignedIntType().equals(new t.UnsignedLongType), false)
assert.equal(new t.BooleanTupleType(5).equals(new t.BooleanTupleType(6)), false)
assert.equal(new t.ArrayType(new t.CharType).equals(new t.SetType(new t.CharType)), false)