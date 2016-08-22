/*eslint-disable no-undef*/
let array = new t.ArrayType(
	new t.UnsignedIntType
)
assert.equal(array.toBuffer(), bufferFrom([0x52, 0x13]))
assert.equal(r.type(array.toBuffer()), array)