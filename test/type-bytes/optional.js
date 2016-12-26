/*eslint-disable no-undef*/
const type = new t.OptionalType(
	new t.SetType(new t.UnsignedLongType)
)
assert.equal(type.toBuffer(), bufferFrom([0x60, 0x53, 0x14]))
assert.equal(r.type(type.toBuffer()), type)