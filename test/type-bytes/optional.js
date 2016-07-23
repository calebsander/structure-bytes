/*eslint-disable no-undef*/
let optional = new t.OptionalType(
	new t.SetType(new t.UnsignedLongType)
);
assert.equal(optional.toBuffer(), Buffer.from([0x60, 0x53, 0x14]));
assert.equal(r.type(optional.toBuffer()), optional);