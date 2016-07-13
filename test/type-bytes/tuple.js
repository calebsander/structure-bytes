let type = new t.TupleType({
	type: new t.BooleanArrayType(),
	length: 3
});
let buffer = type.toBuffer();
assert.equal(buffer, Buffer.from([0x50, 0x32, 0, 0, 0, 3]));
assert.equal(r.type(buffer), type);