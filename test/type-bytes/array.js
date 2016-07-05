let array = new t.ArrayType(
	new t.UnsignedIntType()
);
assert.equal(array.toBuffer(), Buffer.from([0x52, 0x13]));
assert.equal(r.readType(array.toBuffer()), array);